package actors

import actors.StatusPoller._
import actors.StatusWebSocketActor._
import akka.actor._
import akka.pattern._
import akka.util.Timeout
import models.{ClientState, ResponseWrapper}
import play.api.Play.current
import play.api.cache.Cache
import play.api.libs.json.{JsNull, JsArray, JsValue, Json}
import utils.StatusHelper

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

class StatusWebSocketActor(out: ActorRef)
  extends FSM[WSActorState, Option[ClientState]] with ActorLogging with StatusHelper {

  import context.dispatcher

  implicit val askTimeout = Timeout(5.seconds)
  val statusPoller = Await.result(
    (context.system.actorSelection("/user/status-poller")  ? Identify(None)).mapTo[ActorIdentity].map(_.getRef), 5.seconds
  )

  when(Uninitialized)(Map.empty)

  when(Initialized) {
    case Event(ClientStateStatusResult(state, status, jsValue), Some(currentState)) if status == 200 && state.equals(currentState) =>
      log.debug("Pushing new status to client")
      out ! ResponseWrapper(ResponseWrapper.status, status, jsValue, currentState)
      stay()
    case Event(ClientStateStatusResult(state, statusCode, jsValue), Some(currentState)) if state.equals(currentState) =>
      log.debug(s"Pushing failed status to client:\n$statusCode \n$jsValue")
      out ! ResponseWrapper(ResponseWrapper.status, statusCode, jsValue, currentState)
      stay()
    case Event(LoadingStatus(state), Some(currentState)) if state.equals(currentState) =>
      log.debug(s"Pushing loading status to client")
      out ! ResponseWrapper(ResponseWrapper.loading, OK, JsNull, currentState)
      stay()
    case Event(LoadingStatus(state), Some(currentState)) =>
      log.warning(s"Current state $currentState, ignoring loading of old state $state")
      stay()
    case Event(ClientStateStatusResult(state, _, _), Some(currentState)) =>
      log.warning(s"Current state $currentState, ignoring result of old state $state")
      stay()
  }

  whenUnhandled {
    case Event(newState@ClientState(_, _, _, forceRefresh), maybeOldState) =>
      // Subscribe for state updates
      maybeOldState.foreach { oldState =>
        val stateTopic = makeSubscriptionTopic(oldState)
        log.debug(s"Unsubscribing $stateTopic updates")
        statusPoller ! Unsubscribe(makeSubscriptionTopic(stateTopic))
      }
      val stateTopic = makeSubscriptionTopic(newState)
      log.debug(s"Subscribing $stateTopic updates")
      statusPoller ! Subscribe(stateTopic)

      if (forceRefresh.exists(bool => bool)) {
        log.debug("Received state change with force refresh, getting non-cached status for client")
        val stateTopic = makeSubscriptionTopic(newState)
        statusPoller ! GetStatus(stateTopic)
      } else {
        log.debug("Received state change with no force refresh, getting cached history and status for client")
        val historyJsValue = getCachedHistory(newState)
        out ! ResponseWrapper(ResponseWrapper.history, 200, historyJsValue, newState)
        getCachedStatus(newState).fold {
          log.debug(s"No cached status for $newState, telling status-poller to get it")
          statusPoller ! GetStatus(stateTopic)
        } { cachedStatusJsValue =>
          out ! ResponseWrapper(ResponseWrapper.status, 200, cachedStatusJsValue, newState)
        }
      }
      goto(Initialized).using(Some(stateTopic))
  }

  onTermination {
    case StopEvent(_, state, Some(clientState)) =>
      // Unsubscribe
      val stateTopic = makeSubscriptionTopic(clientState)
      log.debug(s"Terminating, unsubscribing from $clientState")
      statusPoller ! Unsubscribe(stateTopic)
  }

  startWith(Uninitialized, None)
  initialize()

  /* Helpers */
  private def getCachedStatus(state: ClientState): Option[JsValue] = {
    val cacheKey = buildCacheKey(state.protocol, state.host, state.dependencies.getOrElse(""))
    Cache.getAs[JsValue](cacheKey)
  }

  private def getCachedHistory(state: ClientState): JsValue = {
    val cacheKey = buildCacheKey(state.protocol, state.host, state.dependencies.getOrElse(""))
    getHistory(cacheKey) match {
      case Some(h) =>
        Json.toJson(h.takeRight(20))
      case _ =>
        JsArray(Nil)
    }
  }
}

object StatusWebSocketActor {

  def props(out: ActorRef) = Props(new StatusWebSocketActor(out))

  sealed trait WSActorState

  private object Uninitialized extends WSActorState

  private object Initialized extends WSActorState

  private def makeSubscriptionTopic(clientState: ClientState): ClientState = {
    clientState.copy(
      dependencies = clientState.dependencies.filter(_.nonEmpty),
      forceRefresh = None
    )
  }
}
