package actors

import actors.StatusPoller.StatusPollerState
import akka.actor._
import akka.pattern.pipe
import akka.routing.{ActorRefRoutee, BroadcastRoutingLogic, Router}
import models.ClientState
import play.api.Application
import play.api.cache.Cache
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSResponse, WS}
import utils.StatusHelper

import scala.collection.JavaConversions._
import scala.concurrent.duration._
import scala.util.Try

class StatusPoller(implicit app: Application)
  extends FSM[StatusPollerState, Map[ClientState, Router]] with ActorLogging with StatusHelper {

  import StatusPoller._
  import context.dispatcher

  val config = context.system.settings.config
  val removeRouterDelay = config.getDuration("microservice-graph-explorer.status-poller.remove-router-delay").toMillis.millis
  val pollInterval = config.getDuration("microservice-graph-explorer.status-poller.poll-interval").toMillis.millis
  val defaultApplications = config.getStringList("microservice-graph-explorer.traverse.applications")

  log.debug("Reading initial applications to poll")
  val defaultApplicationStates = defaultApplications.map {application =>
    val Array(protocol, host, _*) = application.split(",")
    val defaultApplication = ClientState(protocol, host, None, None)
    log.debug(s"Application: ${defaultApplication}")
    defaultApplication
  }
  val initialState = defaultApplicationStates.map(_ -> makeBroadcastingRouter()).toMap

  when(OnlyState) {
    case Event(Poll, clientStateToRouter) =>
      clientStateToRouter.keys.foreach { clientState =>
        self ! GetStatus(clientState)
      }
      stay()

    case Event(GetStatus(clientState), clientStateToRouter) =>
      val url = statusTraverseUrl(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
      log.debug(s"Requesting GET to $url for $clientState")

      clientStateToRouter.get(clientState).foreach { router =>
        if (router.routees.nonEmpty) {
          log.debug(s"Broadcasting loading for $clientState to ${router.routees.size} routees")
          router.route(LoadingStatus(clientState), self)
        } else {
          log.debug(s"No routee to broadcasting loading for $clientState")
        }
      }

      val futureResponse = WS.url(url).get()
      futureResponse.map(resp => StatusResponse(clientState, Some(resp), None)).pipeTo(self)

      futureResponse.recover {
        case e: Exception =>
          self ! StatusResponse(clientState, None, Some(e))
          log.error(s"EXCEPTION on GET $clientState - $e")
      }
      stay()

    case Event(StatusResponse(clientState, Some(response), None), clientStateToRouter) =>
      val url = statusTraverseUrl(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
      val cacheKey = buildCacheKey(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
      val message = response.status match {
        case OK =>
          log.debug(s"GET $url returned 200 for $clientState, updating cache")

          val json = Try {
            addId(response.json)
          }.getOrElse(createGenericError(s"Not a valid json response: ${response.body}"))

          // Update cache
          Cache.set(cacheKey, json, cacheTimeout)
          addToHistory(cacheKey, json)
          // Publish status to subscribers
          ClientStateStatusResult(clientState, OK, json)
        case statusCode =>
          log.warning(s"GET $url returned $statusCode ${response.statusText} for $clientState")
          val json = addId(createGenericError(s"Error response from '$url'. Code: $statusCode, Message: ${response.statusText}"))
          // Update cache
          Cache.set(cacheKey, json, cacheTimeout)
          addToHistory(cacheKey, json)
          // Publish status to subscribers
          ClientStateStatusResult(clientState, statusCode, json)
      }
      clientStateToRouter.get(clientState).foreach { router =>
        if (router.routees.nonEmpty) {
          log.debug(s"Broadcasting update for $clientState to ${router.routees.size} routees")
          router.route(message, self)
        } else {
          log.debug(s"No routee to broadcasting update for $clientState")
        }
      }
      stay()

    case Event(StatusResponse(clientState, None, Some(exception)), clientStateToRouter) =>
      val url = statusTraverseUrl(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
      val cacheKey = buildCacheKey(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
      val json = addId(createGenericError(s"Exception from '$url'. ${exception.getMessage}"))
      // Update cache
      Cache.set(cacheKey, json, cacheTimeout)
      addToHistory(cacheKey, json)
      // Publish status to subscribers
      val message = ClientStateStatusResult(clientState, INTERNAL_SERVER_ERROR, json)

      clientStateToRouter.get(clientState).foreach { router =>
        if (router.routees.nonEmpty) {
          log.debug(s"Broadcasting update for $clientState to ${router.routees.size} routees")
          router.route(message, self)
        } else {
          log.debug(s"No routee to broadcasting update for $clientState")
        }
      }
      stay()

    case Event(RemoveRouter(clientState), clientStateToRouter) =>
      val newClientStateToRouter = clientStateToRouter.get(clientState).map { router =>
        if (router.routees.isEmpty && !defaultApplicationStates.contains(clientState)) {
          log.debug(s"Removing router for $clientState.")
          clientStateToRouter.-(clientState)
        } else {
          log.debug(s"Router for $clientState scheduled for removal but has ${router.routees.size} routee now.")
          clientStateToRouter
        }
      }.getOrElse(clientStateToRouter)
      stay().using(newClientStateToRouter)

    case Event(Unsubscribe(clientState), clientStateToRouter) =>
      val unsubscriber = sender()
      val newClientStateToRouter = clientStateToRouter.get(clientState).map { router =>
          val newRouter = router.removeRoutee(unsubscriber)
          if (newRouter.routees.isEmpty && !defaultApplicationStates.contains(clientState)) {
            // Schedule to remove router if it has no subscriber left and it is not for a base application
            log.debug(s"Scheduling router for $clientState for removal in $removeRouterDelay.")
            val url = statusTraverseUrl(clientState.protocol, clientState.host, clientState.dependencies.getOrElse(""))
            setTimer(url, RemoveRouter(clientState), removeRouterDelay, repeat = false)
          }
          clientStateToRouter.updated(clientState, router.removeRoutee(unsubscriber))
      }.getOrElse(clientStateToRouter)

      stay().using(newClientStateToRouter)

    case Event(Subscribe(clientState), clientStateToRouter) =>
      val subscriber = sender()
      val newClientStateToRouter = clientStateToRouter.get(clientState).map { router =>
        clientStateToRouter.updated(clientState, router.addRoutee(subscriber))
      }.getOrElse {
        clientStateToRouter.updated(clientState, makeBroadcastingRouter(subscriber))
      }
      stay().using(newClientStateToRouter)

    case Event(Status.Failure(t), _) =>
      log.error(t, "Unexpected exception")
      stay()
  }


  startWith(OnlyState, initialState)
  initialize()
  self ! Poll
  setTimer("timer", Poll, pollInterval, repeat = true)

  private def makeBroadcastingRouter(actorRefs: ActorRef*): Router = {
    val routees = actorRefs.map(ActorRefRoutee.apply).toIndexedSeq
    Router(BroadcastRoutingLogic(), routees)
  }
}


object StatusPoller {

  private object Poll

  private case class RemoveRouter(clientState: ClientState)

  private case class StatusResponse(clientState: ClientState, response: Option[WSResponse], exception: Option[Exception])

  def props(app: Application): Props = Props(new StatusPoller()(app))

  sealed trait StatusPollerState

  case object OnlyState extends StatusPollerState

  case class Subscribe(clientState: ClientState)

  case class Unsubscribe(clientState: ClientState)

  case class GetStatus(clientState: ClientState)

  case class ClientStateStatusResult(topic: ClientState, statusCode: Int, payload: JsValue)

  case class LoadingStatus(topic: ClientState)
}
