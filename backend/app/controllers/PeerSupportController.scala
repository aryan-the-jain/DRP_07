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
) extends Controller(cc, executionContext) {

  def group(groupId: Int): Action[AnyContent] =
    peerSupportRepository.findGroup(groupId).returnOk()

  def participants(groupId: Int): Action[AnyContent] =
    peerSupportRepository.participantsForGroup(groupId).returnOk()

  def participantInfo(participantId: Int): Action[AnyContent] =
    peerSupportRepository.participantInfo(participantId).returnOk()

  def messages(groupId: Int): Action[AnyContent] =
    peerSupportRepository.groupMessages(groupId).returnOk()

  def latestReflection(
      groupId: Int,
      participantId: Int
  ): Action[AnyContent] =
    peerSupportRepository.latestReflection(groupId, participantId).returnOk()

  def supportLinks(groupId: Int): Action[AnyContent] =
    if (groupId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room")))
    else
      peerSupportRepository.activeLinksForGroup(groupId).returnOk()

  def meditationPlaylists(groupId: Int): Action[AnyContent] =
    if (groupId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room")))
    else
      peerSupportRepository.activeMeditationPlaylists(groupId).returnOk()

  def sendGroupMessage(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.sendGroupMessage(groupId, _),
    (m: CreateGroupMessage) => m.body.trim.nonEmpty
  )

  def createReflection(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.createReflection(groupId, _),
    (r: CreateReflection) => hasReflectionText(r)
  )

  private def hasReflectionText(reflection: CreateReflection): Boolean =
    reflection.privateNote.exists(_.trim.nonEmpty) ||
      reflection.facilitatorNote.exists(_.trim.nonEmpty) ||
      reflection.facilitatorNote.exists(_.trim.nonEmpty) ||
      reflection.freeWriting.exists(_.trim.nonEmpty)

  def saveDoodle(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.saveDoodle(groupId, _),
    (d: CreateDoodle) => isValidDoodle(d)
  )

  // Reject empty or oversized payloads gracefully. PNG data URLs are large, so we
  // cap the stored size rather than accept an unbounded blob.
  private val MaxDoodleDataLength = 3_000_000
  private def isValidDoodle(doodle: CreateDoodle): Boolean =
    doodle.participantId > 0 &&
      doodle.imageData.startsWith("data:image/png;base64,") &&
      doodle.imageData.length <= MaxDoodleDataLength

  def doodles(groupId: Int, participantId: Int): Action[AnyContent] =
    if (groupId <= 0 || participantId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room or participant")))
    else
      peerSupportRepository
        .doodlesForParticipant(groupId, participantId)
        .returnOk()
}
