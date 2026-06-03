package repositories.PeerSupport // TODO: Should this be in the parent package?

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

// TODO: Sort this out.  It's just yucky.
@Singleton
class PeerSupportRepository @Inject() (executionContext: ExecutionContext) {
  private given ExecutionContext = executionContext

  private val databaseConfig = DatabaseConfig.fromEnvironment()

  private val db = Database.forURL(
    url = databaseConfig.jdbcUrl,
    user = databaseConfig.username,
    password = databaseConfig.password,
    driver = "org.postgresql.Driver"
  )

  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val facilitatorMessages = TableQuery[FacilitatorMessagesTable]
  private val groupMessages = TableQuery[GroupMessagesTable]
  private val reflections = TableQuery[ReflectionsTable]

  private val groupQuerier =
    GroupQueries(supportGroups, groupParticipants, participants)
  private val groupMessageQuerier = GroupMessageQueries(groupMessages)
  private val facilitatorMessageQuerier = FacilitatorMessageQueries(
    facilitatorMessages
  )

  def findGroup(groupId: Int): Future[ReturnSupportGroup] =
    db.run(groupQuerier.selectGroup(groupId).result.head)
      .map(ReturnSupportGroup.apply)

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

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Future[Seq[(Int, Int, String, LocalDateTime)]] =
    db.run(
      facilitatorMessageQuerier
        .selectPrivateMessages(groupId, participantId)
        .result
    )

  // TODO: Refactor
  def createReflection(
      groupId: Int,
      request: CreateReflection
  ): Future[Reflection] = {
    val now = LocalDateTime.now()
    val reflection = Reflection(
      id = 0,
      groupId = groupId,
      privateNote = request.privateNote.map(_.trim).filter(_.nonEmpty),
      facilitatorNote = request.facilitatorNote.map(_.trim).filter(_.nonEmpty),
      sharedWithFacilitator = false,
      createdAt = now,
      sharedAt = None
    )

    val insertQuery =
      (reflections returning reflections.map(_.id)) += reflection

    db.run(insertQuery).flatMap { newId =>
      db.run(reflections.filter(_.id === newId).result.head)
    }
  }

  // TODO: Refactor
  def shareReflection(reflectionId: Int): Future[Option[Reflection]] = {
    val query = reflections.filter(_.id === reflectionId)
    val updateAction = query
      .map(reflection =>
        (reflection.sharedWithFacilitator, reflection.sharedAt)
      )
      .update((true, Some(LocalDateTime.now())))

    db.run(updateAction).flatMap {
      case 0 => Future.successful(None)
      case _ => db.run(query.result.headOption)
    }
  }

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

  def sendFacilitatorMessage(
      groupId: Int,
      message: CreateFacilitatorMessage
  ): Future[Int] = {
    val query = facilitatorMessageQuerier.insertNewMessage(
      FacilitatorMessage(
        message.fromId,
        message.toId,
        groupId,
        message.body,
        LocalDateTime.now()
      )
    )
    db.run(query)
  }
}
