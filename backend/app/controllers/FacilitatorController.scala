package controllers

import models.*
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.Facilitator.FacilitatorRepository

import javax.inject.*
import scala.concurrent.ExecutionContext

/* The facilitator's side of the app: the groups they hold, the people waiting to be
   placed, a full read of any person, placing someone into a group, creating / editing
   a group, and the room's private-messages-and-reflections rail. Reads wrap in 200 OK;
   writes validate then return 201 via the shared `createNew` helper. */
@Singleton
class FacilitatorController @Inject() (
    cc: ControllerComponents,
    facilitatorRepository: FacilitatorRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {

  def groups: Action[AnyContent] =
    facilitatorRepository.groups().returnOk()

  def arrivals: Action[AnyContent] =
    facilitatorRepository.arrivals().returnOk()

  def participant(participantId: Int): Action[AnyContent] =
    facilitatorRepository.participant(participantId).returnOk()

  def inbox(groupId: Int): Action[AnyContent] =
    facilitatorRepository.inbox(groupId).returnOk()

  def createGroup: Action[JsValue] = createNew(
    facilitatorRepository.createGroup,
    (g: CreateGroup) =>
      g.name.trim.nonEmpty && validSchedule(g.dayOfWeek, g.scheduledTime) &&
        validDuration(g.scheduledDurationMinutes)
  )

  def updateGroup(groupId: Int): Action[JsValue] = createNew(
    facilitatorRepository.updateGroup(groupId, _),
    (g: UpdateGroup) =>
      g.name.trim.nonEmpty && validSchedule(g.dayOfWeek, g.scheduledTime) &&
        validDuration(g.scheduledDurationMinutes)
  )

  def placeParticipant(groupId: Int): Action[JsValue] = createNew(
    facilitatorRepository.place(groupId, _),
    (_: PlaceParticipant) => true
  )

  def groupNotes(groupId: Int): Action[AnyContent] =
    facilitatorRepository.groupNotes(groupId).returnOk()

  def updateGroupNotes(groupId: Int): Action[JsValue] = createNew(
    facilitatorRepository.upsertGroupNotes(groupId, _),
    (_: UpdateGroupNotes) => true
  )

  def deleteGroup(groupId: Int): Action[AnyContent] =
    Action.async {
      facilitatorRepository.deleteGroup(groupId).map(_ => Ok)
    }

  private def validSchedule(dayOfWeek: String, time: String): Boolean =
    scala.util.Try {
      java.time.DayOfWeek.valueOf(dayOfWeek)
      java.time.LocalTime.parse(time)
    }.isSuccess

  // Sessions stay gentle: 15 minutes to an hour, in 5-minute steps.
  private def validDuration(minutes: Int): Boolean =
    minutes >= 15 && minutes <= 60 && minutes % 5 == 0
}
