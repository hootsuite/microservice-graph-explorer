package models

import play.api.libs.json.{Json, JsValue}
import play.api.mvc.WebSocket.FrameFormatter

case class ResponseWrapper(
  responseType: String,
  statusCode: Int,
  payload: JsValue,
  state: ClientState
  )

object ResponseWrapper {
  val history: String = "history"
  val status: String = "status"
  val loading: String = "loading"
  implicit val fmt = Json.format[ResponseWrapper]
  implicit val frameFmt = FrameFormatter.jsonFrame[ResponseWrapper]
}
