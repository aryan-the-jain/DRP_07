package repositories.PeerSupport // TODO: Should this be in the parent package?

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.*
import repositories.Repository

@Singleton
class PeerSupportRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val groupMessages = TableQuery[GroupMessagesTable]

  private val groupQuerier =
    GroupQueries(supportGroups, groupParticipants, participants)
  private val groupMessageQuerier = GroupMessageQueries(groupMessages)

  def findGroup(groupId: Int): Future[ReturnSupportGroup] =
    db.run(groupQuerier.selectGroup(groupId).result.head)
      .map { case (name, facilitatorName, duration, day, time) =>
        // Day and time live in the DB; expose them as plain strings so the
        // existing Json.writes macro can serialise them without a LocalTime
        // writer (e.g. "FRIDAY", "17:00").
        ReturnSupportGroup(
          name,
          facilitatorName,
          duration,
          day.name(),
          time.toString
        )
      }

  def participantsForGroup(
      groupId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipants(groupId).result)
      .map(_.map(ReturnParticipant.apply))

  def participantInfo(
      participantId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipantInfo(participantId).result)
      .map(_.map(ReturnParticipant.apply))

  def groupMessages(groupId: Int): Future[Seq[ReturnGroupMessage]] =
    db.run(groupMessageQuerier.selectMessagesFromParticipant(groupId).result)
      .map(_.map(ReturnGroupMessage.apply))

  def sendGroupMessage(
      groupId: Int,
      message: CreateGroupMessage
  ): Future[Seq[ReturnGroupMessage]] = {
    val query = groupMessageQuerier.insertNewMessage(
      GroupMessage(
        message.participantId,
        groupId,
        message.body,
        LocalDateTime.now()
      )
    )
    db.run(query)
    groupMessages(groupId) // TODO: Get rid
  }

  def signUp(request: SignUpRequest): Future[ReturnParticipant] = {
    val initials = if (request.name.trim.nonEmpty) request.name.trim.substring(0, 1).toUpperCase else "U"
    val newParticipant = Participant(
      participantId = 0,
      name = request.name.trim,
      pronouns = None,
      initials = initials,
      age = None,
      culturalBackground = None,
      hobbies = Nil,
      fact = "",
      griefRecency = None,
      whoLost = None,
      role = Role.PARTICIPANT,
      onboardingStatus = "draft"
    )

    val action = for {
      newId <- (participants returning participants.map(_.participantId)) += newParticipant
      _ <- groupParticipants += GroupParticipants(1, newId)
      p <- participants.filter(_.participantId === newId).result.head
    } yield ReturnParticipant(
      p.participantId,
      p.name,
      p.pronouns,
      p.initials,
      p.hobbies,
      p.fact,
      p.role
    )

    db.run(action.transactionally)
  }
}

