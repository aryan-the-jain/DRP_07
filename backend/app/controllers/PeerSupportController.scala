package controllers

import models._
import models.JsonFormats._
import play.api.libs.json._
import play.api.mvc._
import repositories.PeerSupportRepository

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

/* Essentially, each one of these controller functions takes in the given groupId and executes
   the relevant code in the model.  Provided this is successful, we then wrap the result in a Http
   200 OK response. */
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

  def shareReflection(reflectionId: Int): Action[AnyContent] =
    peerSupportRepository.shareReflection(reflectionId).returnOk()

  /* Validates the request and returns an object of JsSuccess(A, _), where A is CreateMessage or
     CreateReflection.  If this inner A is well-formed, we then map it into the actual GroupMessage
     or Reflection, convert it to JSON and return the object.  In the event of an error, we return
     a generic error message because the frontend will handle it as needed. */
  private def createNew[A, B](create: A => Future[B], successCond: A => Boolean)
      (implicit r: Reads[A], w: Writes[B]): Action[JsValue] = Action.async(parse.json) { req =>
    req.body.validate[A] match {
      case JsSuccess(createe, _) if successCond(createe) =>
        create(createe).map(saved => Created(Json.toJson(saved)))
      case _ => Future.successful(BadRequest(Json.obj("error" -> "Message failed")))
    }
  }

  def createMessage(groupId: Int): Action[JsValue] = createNew(
      peerSupportRepository.createMessage(groupId, _, MessageType.GROUP_WIDE),
      (m: CreateMessage) => m.body.trim.nonEmpty
    )

  def createFacilitatorMessage(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.createMessage(groupId, _, MessageType.FACILITATOR_DIRECT),
    (m: CreateMessage) => m.body.trim.nonEmpty
  )

  def createReflection(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.createReflection(groupId, _),
    (r: CreateReflection) => hasReflectionText(r)
  )

  private def hasReflectionText(reflection: CreateReflection): Boolean = {
    reflection.privateNote.exists(_.trim.nonEmpty) ||
    reflection.facilitatorNote.exists(_.trim.nonEmpty)
  }
}
