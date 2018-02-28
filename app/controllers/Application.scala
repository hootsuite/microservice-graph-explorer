package controllers

import actors.StatusWebSocketActor
import models.{HomeLink, ClientState, ResponseWrapper}
import play.api.mvc._
import play.api.Play.current
import play.api.Play
import play.api.libs.json._

import scala.concurrent.Future

class Application extends Controller {

  def index = Action {
    Ok(views.html.index("Microservice Graph Explorer"))
  }

  def widget = Action {
    Ok(views.html.widget("Microservice Graph Explorer"))
  }

  def socket = WebSocket.acceptWithActor[ClientState, ResponseWrapper] { request => out =>
    StatusWebSocketActor.props(out)
  }

  def homeLinks = Action.async { implicit request =>
    val applicationsStringList = Play.current.configuration.getStringSeq("microservice-graph-explorer.traverse.applications")
    val applications = applicationsStringList.getOrElse(Seq()).map { application =>
      val appVars = application.split(",")
      HomeLink(
        protocol = appVars(0),
        url = appVars(1),
        text = appVars(2)
      )
    }

    Future.successful(Ok(Json.toJson(applications)))
  }
}
