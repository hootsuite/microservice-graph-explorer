package controllers

import play.api.Play.current
import play.api.cache.Cache
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WS
import play.api.mvc._
import utils.StatusHelper

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Status extends Controller with StatusHelper {

  def about(protocol: String, host: String) = Action.async {
    val dHost = decode(host)
    val cachKey = buildCacheKey(protocol, dHost, "")
    val maybeCachedResponse = Cache.getAs[JsValue](cachKey)

    maybeCachedResponse match {
      case Some(r) =>
        Future.successful(Ok(maybeCachedResponse.get))
      case _ =>
        WS.url(statusAboutUrl(protocol, dHost)).get().map { response =>
          val json = addId(Json.parse(response.body))
          Cache.set(cachKey, json, cacheTimeout)
          Ok(json)
        }
    }
  }

  def traverse(protocol: String, host: String) = Action.async { implicit request =>
    val dHost = decode(host)
    val dependencies = getDependenciesFromQuerystring(request)
    val forceRefresh = request.getQueryString("forceRefresh").getOrElse("false").toBoolean
    val cacheKey = buildCacheKey(protocol, dHost, dependencies)
    val maybeCachedResponse = Cache.getAs[JsValue](cacheKey)

    maybeCachedResponse match {
      case Some(r) if !forceRefresh =>
        Future.successful(Ok(r))
      case _ =>
        WS.url(statusTraverseUrl(protocol, dHost, dependencies)).get().map { response =>
          response.status match {
            case OK =>
              val json = addId(Json.parse(response.body))
              Cache.set(cacheKey, json, cacheTimeout)
              addToHistory(cacheKey, json)
              Ok(json)
            case NOT_FOUND =>
              NotFound(response.body)
            case INTERNAL_SERVER_ERROR =>
              InternalServerError(response.body)
            case _ =>
              InternalServerError(response.body)
          }
        }
    }
  }

  def history(protocol: String, host: String) = Action.async { implicit request =>
    val dHost = decode(host)
    val dependencies = getDependenciesFromQuerystring(request)
    val cacheKey = buildCacheKey(protocol, dHost, dependencies)
    val count = request.getQueryString("count").getOrElse("20").toInt

    val history = getHistory(cacheKey) match {
      case Some(h) =>
        Ok(Json.toJson(h.takeRight(count)))
      case _ =>
        Ok("[]")
    }

    Future.successful(history)
  }
}
