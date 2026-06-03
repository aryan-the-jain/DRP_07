package controllers

import models.*
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.PeerSupport.PeerSupportRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

/* Essentially, each one of these controller functions takes in the given groupId and executes
   the relevant code in the model.  Provided this is successful, we then wrap the result in a Http
   200 OK response. */
@Singleton
class PeerSupportController @Inject() (
    cc: ControllerComponents,
    peerSupportRepository: PeerSupportRepository,
    executionContext: ExecutionContext
) extends AbstractController(cc) {
  private given ExecutionContext = executionContext

  extension [A](req: Future[A])
    def returnOk()(using Writes[A]): Action[AnyContent] = Action.async {
      req.map(v => Ok(Json.toJson(v)))
    }

  def group(groupId: Int): Action[AnyContent] =
    peerSupportRepository.findGroup(groupId).returnOk()

  def participants(groupId: Int): Action[AnyContent] =
    peerSupportRepository.participantsForGroup(groupId).returnOk()

  def participantInfo(participantId: Int): Action[AnyContent] =
    peerSupportRepository.participantInfo(participantId).returnOk()

  def messages(groupId: Int): Action[AnyContent] =
    peerSupportRepository.groupMessages(groupId).returnOk()

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Action[AnyContent] =
    peerSupportRepository.facilitatorMessages(groupId, participantId).returnOk()

  def shareReflection(reflectionId: Int): Action[AnyContent] =
    peerSupportRepository.shareReflection(reflectionId).returnOk()

  /* Validates the request and returns an object of JsSuccess(A, _), where A is CreateMessage or
     CreateReflection.  If this inner A is well-formed, we then map it into the actual GroupMessage
     or Reflection, convert it to JSON and return the object.  In the event of an error, we return
     a generic error message because the frontend will handle it as needed. */
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

  def sendGroupMessage(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.sendGroupMessage(groupId, _),
    (m: CreateGroupMessage) => m.body.trim.nonEmpty
  )

  def sendFacilitatorMessage(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.sendFacilitatorMessage(groupId, _),
    (m: CreateFacilitatorMessage) => m.body.trim.nonEmpty
  )

  def createReflection(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.createReflection(groupId, _),
    (r: CreateReflection) => hasReflectionText(r)
  )

  private def hasReflectionText(reflection: CreateReflection): Boolean =
    reflection.privateNote.exists(_.trim.nonEmpty) ||
      reflection.facilitatorNote.exists(_.trim.nonEmpty)

  /* Returns the saved onboarding survey answers for a participant so the survey
     Returns the saved object or JSON null — never 404, since the participant always exists. */
  def onboarding(participantId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository
      .onboarding(participantId)
      .map(result => Ok(Json.toJson(result)))
  }

  /* Saves the onboarding survey (a "draft" on "save & come back later", or
     "complete" on finish).  Drafts are lenient; a complete submission must carry
     a call name and an age. */
  def saveOnboarding(participantId: Int): Action[JsValue] =
    Action.async(parse.json) { req =>
      req.body.validate[UpdateOnboarding] match {
        case JsSuccess(onboarding, _) if isValidOnboarding(onboarding) =>
          peerSupportRepository.saveOnboarding(participantId, onboarding).map {
            case Some(saved) => Ok(Json.toJson(saved))
            case None => NotFound(Json.obj("error" -> "Participant not found"))
          }
        case JsSuccess(_, _) =>
          Future.successful(
            BadRequest(Json.obj("error" -> "Onboarding failed"))
          )
        case JsError(errors) =>
          Future.successful(
            BadRequest(Json.obj("error" -> JsError.toJson(errors)))
          )
      }
    }

  private def isValidOnboarding(onboarding: UpdateOnboarding): Boolean =
    onboarding.status match {
      case "draft"    => true
      case "complete" =>
        onboarding.callName.trim.nonEmpty && onboarding.age.isDefined
      case _ => false
    }
}
