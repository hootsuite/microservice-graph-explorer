package models

import play.api.libs.json.Json
import play.api.mvc.WebSocket.FrameFormatter

case class ClientState(
  protocol: String,
  host: String,
  dependencies: Option[String],
  forceRefresh: Option[Boolean]
  ) {
  override def equals(other: Any) = other match {
    case that: ClientState =>
      that.protocol == protocol &&
        that.host == host &&
        that.dependencies.filter(_.nonEmpty) == dependencies.filter(_.nonEmpty)
    case _ => false
  }
}

object ClientState {
  implicit val fmt = Json.format[ClientState]
  implicit val frameFmt = FrameFormatter.jsonFrame[ClientState]
}
