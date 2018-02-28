package models

import play.api.libs.json.Json

case class HomeLink(
  protocol: String,
  text: String,
  url: String
)

object HomeLink {
  implicit val fmt = Json.format[HomeLink]
}
