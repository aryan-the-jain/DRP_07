package repositories.Facilitator

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.PeerSupport.Instances.given

import java.time.{DayOfWeek, LocalDateTime, LocalTime}
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.*
import repositories.Repository

/* The facilitator's read/write surface: every group they hold (with members), the
   people who finished onboarding and are waiting to be placed, the full read of a
   person (including the carried loss), placing a person into a group, creating /
   editing a group, and the room's "privately with you" rail. */
@Singleton
class FacilitatorRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val facilitatorMessages = TableQuery[FacilitatorMessagesTable]
  private val reflections = TableQuery[ReflectionsTable]

  private def member(p: Participant): ReturnFacilitatorMember =
    ReturnFacilitatorMember(
      p.participantId,
      p.name,
      p.initials,
      p.pronouns,
      p.role
    )

  private def detail(
      p: Participant,
      groupId: Option[Int]
  ): ReturnFacilitatorParticipant =
    ReturnFacilitatorParticipant(
      p.participantId,
      p.name,
      p.pronouns,
      p.age,
      p.initials,
      p.fact,
      p.hobbies,
      p.culturalBackground,
      p.griefRecency,
      p.whoLost,
      p.role,
      p.onboardingStatus,
      groupId
    )

  /* Every group, each with its member summaries. Scheduling is left as the raw
     day/time so the frontend can format "live tonight" / "next …" itself. */
  def groups(): Future[Seq[ReturnFacilitatorGroup]] =
    for {
      gs <- db.run(supportGroups.sortBy(_.groupId).result)
      gps <- db.run(groupParticipants.result)
      ps <- db.run(participants.result)
    } yield {
      val byId = ps.map(p => p.participantId -> p).toMap
      gs.map { g =>
        val members = gps
          .filter(_.groupId == g.groupId)
          .flatMap(gp => byId.get(gp.participantId))
          .map(member)
        ReturnFacilitatorGroup(
          g.groupId,
          g.name,
          g.day.name(),
          g.time.toString,
          g.duration,
          g.description,
          members
        )
      }
    }

  /* People who finished onboarding and are not yet in any group. */
  def arrivals(): Future[Seq[ReturnFacilitatorParticipant]] = {
    val placed = groupParticipants.map(_.participantId)
    val query = participants.filter(p =>
      p.onboardingStatus === "complete" &&
        p.role === (Role.PARTICIPANT: Role) &&
        !p.participantId.in(placed)
    )
    db.run(query.result).map(_.map(p => detail(p, None)))
  }

  /* The full facilitator read of one person, with their group if placed. */
  def participant(
      participantId: Int
  ): Future[Option[ReturnFacilitatorParticipant]] =
    for {
      maybe <- db.run(
        participants.filter(_.participantId === participantId).result.headOption
      )
      groupId <- db.run(
        groupParticipants
          .filter(_.participantId === participantId)
          .map(_.groupId)
          .result
          .headOption
      )
    } yield maybe.map(p => detail(p, groupId))

  /* Place a person into a group — idempotent (no-op if already a member). */
  def place(groupId: Int, place: PlaceParticipant): Future[Int] = {
    val already = groupParticipants.filter(gp =>
      gp.groupId === groupId && gp.participantId === place.participantId
    )
    db.run(already.exists.result).flatMap {
      case true  => Future.successful(0)
      case false =>
        db.run(
          groupParticipants += GroupParticipants(groupId, place.participantId)
        )
    }
  }

  /* Create a group. Groups are always weekly; the facilitator manages membership,
     so there is no cap. Duration defaults to a gentle hour. */
  def createGroup(create: CreateGroup): Future[ReturnFacilitatorGroup] = {
    val newGroup = SupportGroup(
      0,
      create.name,
      DayOfWeek.valueOf(create.dayOfWeek),
      LocalTime.parse(create.scheduledTime),
      create.scheduledDurationMinutes,
      create.description
    )
    val insert =
      (supportGroups returning supportGroups.map(_.groupId)) += newGroup
    db.run(insert).map { newId =>
      ReturnFacilitatorGroup(
        newId,
        create.name,
        create.dayOfWeek,
        create.scheduledTime,
        create.scheduledDurationMinutes,
        create.description,
        Seq.empty
      )
    }
  }

  /* Edit a group's name, schedule, duration and blurb. */
  def updateGroup(groupId: Int, update: UpdateGroup): Future[Int] =
    db.run(
      supportGroups
        .filter(_.groupId === groupId)
        .map(g => (g.name, g.day, g.time, g.duration, g.description))
        .update(
          (
            update.name,
            DayOfWeek.valueOf(update.dayOfWeek),
            LocalTime.parse(update.scheduledTime),
            update.scheduledDurationMinutes,
            update.description
          )
        )
    )

  /* The room rail: for each member, their last private message and the parts of
     their reflection they chose to share. No read-state exists in the DB, so
     "unread" is approximated as "the last message in the thread is from them". */
  def inbox(groupId: Int): Future[Seq[ReturnInboxEntry]] =
    for {
      gps <- db.run(groupParticipants.filter(_.groupId === groupId).result)
      ps <- db.run(participants.result)
      msgs <- db.run(facilitatorMessages.filter(_.groupId === groupId).result)
      refs <- db.run(reflections.filter(_.groupId === groupId).result)
    } yield {
      val byId = ps.map(p => p.participantId -> p).toMap
      gps
        .flatMap(gp => byId.get(gp.participantId))
        .filter(_.role == Role.PARTICIPANT)
        .map { p =>
          val id = p.participantId
          val last = msgs
            .filter(m => m.fromId == id || m.toId == id)
            .sortBy(_.createdAt)
            .lastOption
          val ref = refs.find(_.participantId == id)
          ReturnInboxEntry(
            member(p),
            last.map(_.body),
            last.map(_.fromId),
            last.map(_.createdAt),
            last.exists(_.fromId == id),
            ref.filter(_.sharedGuided).flatMap(_.facilitatorNote),
            ref.filter(_.sharedFreeWriting).flatMap(_.freeWriting)
          )
        }
    }
}
