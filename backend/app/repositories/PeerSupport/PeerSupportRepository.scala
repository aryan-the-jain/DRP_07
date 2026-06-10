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
      .map { case (name, facilitatorName, duration, day, time, description) =>
        // Day and time live in the DB; expose them as plain strings so the
        // existing Json.writes macro can serialise them without a LocalTime
        // writer (e.g. "FRIDAY", "17:00").
        ReturnSupportGroup(
          name,
          facilitatorName,
          duration,
          day.name(),
          time.toString,
          description
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
        getCurrentTime()
      )
    )
    db.run(query)
    groupMessages(groupId) // TODO: Get rid
  }

  def isValidSessionNow(groupId: Int): Future[ReturnIsSessionNow] = {
    val query = groupQuerier.isSessionValid(groupId)
    db.run(query.result.head).map(ReturnIsSessionNow.apply)
  }

  def startSession(groupId: Int): Future[Int] =
    db.run(groupQuerier.startSession(groupId))

  def endSession(groupId: Int): Future[Int] =
    db.run(groupQuerier.endSession(groupId))
}
