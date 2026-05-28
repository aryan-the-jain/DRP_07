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

  def group(groupId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.findGroup(groupId).map {
      case Some(group) => Ok(Json.toJson(group))
      case None        => NotFound(Json.obj("error" -> "Group not found"))
    }
  }

  def participants(groupId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.participantsForGroup(groupId).map { participants =>
      Ok(Json.toJson(participants))
    }
  }

  def messages(groupId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.groupMessagesForGroup(groupId).map { messages =>
      Ok(Json.toJson(messages))
    }
  }

  def facilitatorMessages(groupId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.facilitatorMessagesForGroup(groupId).map { messages =>
      Ok(Json.toJson(messages))
    }
  }

  def createMessage(groupId: Int): Action[JsValue] = Action.async(parse.json) {
    request =>
      request.body.validate[CreateGroupMessage] match {
        case JsSuccess(createMessage, _) if createMessage.body.trim.nonEmpty =>
          peerSupportRepository
            .createGroupMessage(groupId, createMessage)
            .map(savedMessage => Created(Json.toJson(savedMessage)))

        case JsSuccess(_, _) =>
          Future.successful(BadRequest(Json.obj("error" -> "Message cannot be empty")))

        case JsError(errors) =>
          Future.successful(BadRequest(Json.obj("error" -> JsError.toJson(errors))))
      }
  }

  def createFacilitatorMessage(groupId: Int): Action[JsValue] =
    Action.async(parse.json) { request =>
      request.body.validate[CreateFacilitatorMessage] match {
        case JsSuccess(createMessage, _) if createMessage.body.trim.nonEmpty =>
          peerSupportRepository
            .createFacilitatorMessage(groupId, createMessage)
            .map(savedMessage => Created(Json.toJson(savedMessage)))

        case JsSuccess(_, _) =>
          Future.successful(BadRequest(Json.obj("error" -> "Message cannot be empty")))

        case JsError(errors) =>
          Future.successful(BadRequest(Json.obj("error" -> JsError.toJson(errors))))
      }
    }

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

  def shareReflection(reflectionId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.shareReflection(reflectionId).map {
      case Some(reflection) => Ok(Json.toJson(reflection))
      case None            => NotFound(Json.obj("error" -> "Reflection not found"))
    }
  }

  private def hasReflectionText(reflection: CreateReflection): Boolean = {
    reflection.privateNote.exists(_.trim.nonEmpty) ||
    reflection.facilitatorNote.exists(_.trim.nonEmpty)
  }
}
