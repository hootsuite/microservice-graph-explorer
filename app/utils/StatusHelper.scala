package utils

import play.api.Application
import play.api.cache.Cache
import play.api.http.Status
import play.api.libs.json._
import play.api.mvc.{AnyContent, Request}
import java.net.URLDecoder

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

trait StatusHelper extends Status {
  val cacheTimeout = 60.seconds
  val cacheLimit = 100

  def statusAboutUrl(protocol: String, host: String): String =
    s"$protocol://$host/status/about"

  def statusTraverseUrl(protocol: String, host: String, dependencies: String): String =
    if (dependencies.isEmpty)
      s"$protocol://$host/status/traverse"
    else
      s"$protocol://$host/status/traverse?dependencies=$dependencies"

  def decode(param: String): String = {
    URLDecoder.decode(param)
  }

  def buildCacheKey(protocol: String, host: String, dependencies: String) = {
    s"status/traverse:$protocol:$host:$dependencies"
  }

  def buildHistoryCacheKey(cacheKey: String) = {
    s"history:$cacheKey"
  }

  def getDependenciesFromQuerystring(request: Request[AnyContent]) = {
    request.getQueryString("path").getOrElse("")
  }

  def getHistory(cacheKey: String)(implicit app: Application) = {
    val historyCacheKey = buildHistoryCacheKey(cacheKey)
    // println(s"Get History: ${historyCacheKey}")
    Cache.getAs[List[JsValue]](historyCacheKey)
  }

  def addToHistory(cacheKey: String, value: JsValue)(implicit app: Application, ec: ExecutionContext) = {
    Future {
      val historyCacheKey = buildHistoryCacheKey(cacheKey)
      // println(s"Add to History: ${historyCacheKey}")
      val updateHistory = Cache.getAs[List[JsValue]](historyCacheKey) match {
        case Some(h) =>
          // println(s"History Length: ${h.length}")
          (h :+ value).takeRight(cacheLimit)
        case _ =>
          // println("History Length: 0")
          Seq(value)
      }
      Cache.set(historyCacheKey, updateHistory)
    }
  }

  def addId(json: JsValue) = {
    val jsObj = json match {
      case JsObject(_) =>
        json.as[JsObject]
      case JsArray(_) =>
        try {
          val a: JsArray = json.as[JsArray]
          val error = a(1).as[JsObject]
          val details = (error \ "details").as[String]
          val description = (error \ "description").as[String]
          createGenericError(s"$description: $details")
        } catch {
          case e: Exception =>
            createGenericError(s"Error parsing Json Response: ${json.toString()}")
        }
      case _ =>
        createGenericError(s"Unknown response format: ${json.toString()}")
    }

    val o = jsObj ++ Json.obj("timestamp" -> (System.currentTimeMillis / 1000).toString)
    o.as[JsValue]
  }

  def createGenericError(errorMessage: String) = {
    JsObject(Seq(
      ("errorMessage",JsString(errorMessage))
    ))
  }
}
