package controllers

import models._
import models.JsonFormats._
import play.api.libs.json._
import play.api.mvc._
import repositories.PeerSupportRepository

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class PeerSupportController @Inject() (
    cc: ControllerComponents,
    peerSupportRepository: PeerSupportRepository
)(implicit executionContext: ExecutionContext)
    extends AbstractController(cc) {

  private implicit class GroupRequest[A](req: Future[A]) {
    def returnOk()(implicit w: Writes[A]): Action[AnyContent] = Action.async {
      req.map(v => Ok(Json.toJson(v)))
    }
  }

  def group(groupId: Int): Action[AnyContent] =
    peerSupportRepository.findGroup(groupId).returnOk()

  def participants(groupId: Int): Action[AnyContent] =
    peerSupportRepository.participantsForGroup(groupId).returnOk()

  def messages(groupId: Int): Action[AnyContent] =
    peerSupportRepository.groupMessagesForGroup(groupId).returnOk()

  def facilitatorMessages(groupId: Int): Action[AnyContent] =
    peerSupportRepository.facilitatorMessagesForGroup(groupId).returnOk()

  private def createNew(create: CreateMessage => Future[GroupMessage]): Action[JsValue] = Action.async(parse.json) { req =>
    req.body.validate[CreateMessage] match {
      case JsSuccess(createe, _) if createe.body.trim.nonEmpty =>
        create(createe).map(savedMsg => Created(Json.toJson(savedMsg)))
      case _ => Future.successful(BadRequest(Json.obj("error" -> "Message failed")))
    }
  }

  def createMessage(groupId: Int): Action[JsValue] =
    createNew(peerSupportRepository.createMessage(groupId, _, MessageType.GROUP_WIDE))

  def createFacilitatorMessage(groupId: Int): Action[JsValue] =
    createNew(peerSupportRepository.createMessage(groupId, _, MessageType.FACILITATOR_DIRECT))

  def createReflection(groupId: Int): Action[JsValue] = Action.async(parse.json) {
    request =>
      request.body.validate[CreateReflection] match {
        case JsSuccess(createReflection, _) if hasReflectionText(createReflection) =>
          peerSupportRepository
            .createReflection(groupId, createReflection)
            .map(savedReflection => Created(Json.toJson(savedReflection)))

        case JsSuccess(_, _) =>
          Future.successful(
            BadRequest(Json.obj("error" -> "Reflection cannot be empty"))
          )

        case JsError(errors) =>
          Future.successful(BadRequest(Json.obj("error" -> JsError.toJson(errors))))
      }
  }

  def shareReflection(reflectionId: Int): Action[AnyContent] =
    peerSupportRepository.shareReflection(reflectionId).returnOk()

  private def hasReflectionText(reflection: CreateReflection): Boolean = {
    reflection.privateNote.exists(_.trim.nonEmpty) ||
    reflection.facilitatorNote.exists(_.trim.nonEmpty)
  }
}
