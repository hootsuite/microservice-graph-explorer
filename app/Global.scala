import actors.StatusPoller
import play.api.libs.concurrent.Akka
import play.api.{Application, GlobalSettings}

object Global extends GlobalSettings {

  override def onStart(app: Application) = {
    Akka.system(app).log.debug("Starting status poller actor")
    Akka.system(app).actorOf(StatusPoller.props(app), name = "status-poller")
  }
}
