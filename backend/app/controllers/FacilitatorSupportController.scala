package controllers

import models.*
import models.JsonFormats.given
import play.api.mvc.*
import play.api.libs.json.*
import repositories.FacilitatorSupport.FacilitatorSupportRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class FacilitatorSupportController @Inject() (
    cc: ControllerComponents,
    facilitatorSupportRepository: FacilitatorSupportRepository,
    executionContext: ExecutionContext
) extends AbstractController(cc) {
  private given ExecutionContext = executionContext

  extension [A](req: Future[A])
    def returnOk()(using Writes[A]): Action[AnyContent] = Action.async {
      req.map(v => Ok(Json.toJson(v)))
    }

  private def createNew[A, B](
      create: A => Future[B],
      successCond: A => Boolean
  )(using Reads[A], Writes[B]): Action[JsValue] = Action.async(parse.json) {
    req =>
      req.body.validate[A] match {
        case JsSuccess(createe, _) if successCond(createe) =>
          create(createe).map(saved => Created(Json.toJson(saved)))
        case _ =>
          Future.successful(BadRequest(Json.obj("error" -> "Message failed")))
      }
  }

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Action[AnyContent] =
    facilitatorSupportRepository.facilitatorMessages(groupId, participantId).returnOk()

  def sendFacilitatorMessage(groupId: Int): Action[JsValue] = createNew(
    facilitatorSupportRepository.sendFacilitatorMessage(groupId, _),
    (m: CreateFacilitatorMessage) => m.body.trim.nonEmpty
  )
}
