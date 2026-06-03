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

  private val groupQuerier = GroupQueries(supportGroups, groupParticipants, participants)
  private val groupMessageQuerier = GroupMessageQueries(groupMessages)
  private val facilitatorMessagesQuerier = FacilitatorMessageQueries(facilitatorMessages)

  def findGroup(groupId: Int): Future[Option[(String, String, Int)]] =
    db.run(groupQuerier.selectGroup(groupId).result.headOption)

  def participantsForGroup(groupId: Int): Future[Seq[(String, String, String, String, String, Role)]] =
    db.run(groupQuerier.selectParticipants(groupId).result)

  def groupMessagesForGroup(groupId: Int): Future[Seq[(Int, String, LocalDateTime)]] =
    db.run(groupMessageQuerier.selectMessagesFromParticipant(groupId).result)

  def facilitatorMessages(groupId: Int, participantId: Int): Future[Seq[(Int, String, LocalDateTime)]] = {
    val query = groupQuerier.selectFacilitator(groupId).result.head.flatMap { facilitatorId =>
      facilitatorMessagesQuerier.selectPrivateMessages(groupId, participantId, facilitatorId).result
    }
    db.run(query)
  }

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

  def createMessage(
      groupId: Int,
      request: CreateMessage,
      messageType: MessageType
  ): Future[GroupMessage] = {
    val message = GroupMessage(
      id = 0, // TODO: Why is this hard-coded as 0?!!!!!
      groupId,
      request.senderName.getOrElse("You"), // TODO: Remove magic string!!
      Role.PARTICIPANT,
      request.body.trim,
      messageType,
      LocalDateTime.now()
    )

    val insertQuery =
      (groupMessages returning groupMessages.map(_.id)) += message

    db.run(insertQuery).flatMap { newId =>
      db.run(groupMessages.filter(_.id === newId).result.head)
    }
  }
}
