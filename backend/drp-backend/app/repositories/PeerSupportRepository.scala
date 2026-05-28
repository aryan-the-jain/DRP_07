package repositories

import config.DatabaseConfig
import models._
import slick.jdbc.PostgresProfile.api._

import java.time.LocalDateTime
import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class PeerSupportRepository @Inject() ()(implicit executionContext: ExecutionContext) {
  private val databaseConfig = DatabaseConfig.fromEnvironment()

  private val db = Database.forURL(
    url = databaseConfig.jdbcUrl,
    user = databaseConfig.username,
    password = databaseConfig.password,
    driver = "org.postgresql.Driver"
  )

  private class SupportGroupsTable(tag: Tag)
      extends Table[SupportGroup](tag, "support_groups") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name")
    def facilitatorName = column[String]("facilitator_name")
    def scheduledDurationMinutes = column[Int]("scheduled_duration_minutes")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, name, facilitatorName, scheduledDurationMinutes, createdAt) <> (
        SupportGroup.tupled,
        SupportGroup.unapply
      )
  }

  private class ParticipantsTable(tag: Tag)
      extends Table[Participant](tag, "participants") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def groupId = column[Int]("group_id")
    def displayName = column[String]("display_name")
    def initials = column[String]("initials")
    def aboutMe = column[String]("about_me")
    def funFact = column[String]("fun_fact")
    def role = column[String]("role")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, groupId, displayName, initials, aboutMe, funFact, role, createdAt) <> (
        Participant.tupled,
        Participant.unapply
      )
  }

  private class GroupMessagesTable(tag: Tag)
      extends Table[GroupMessage](tag, "group_messages") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def groupId = column[Int]("group_id")
    def senderName = column[String]("sender_name")
    def senderRole = column[String]("sender_role")
    def body = column[String]("body")
    def messageType = column[String]("message_type")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, groupId, senderName, senderRole, body, messageType, createdAt) <> (
        GroupMessage.tupled,
        GroupMessage.unapply
      )
  }

  private class ReflectionsTable(tag: Tag)
      extends Table[Reflection](tag, "reflections") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def groupId = column[Int]("group_id")
    def privateNote = column[Option[String]]("private_note")
    def facilitatorNote = column[Option[String]]("facilitator_note")
    def sharedWithFacilitator = column[Boolean]("shared_with_facilitator")
    def createdAt = column[LocalDateTime]("created_at")
    def sharedAt = column[Option[LocalDateTime]]("shared_at")

    def * =
      (
        id,
        groupId,
        privateNote,
        facilitatorNote,
        sharedWithFacilitator,
        createdAt,
        sharedAt
      ) <> (
        Reflection.tupled,
        Reflection.unapply
      )
  }

  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupMessages = TableQuery[GroupMessagesTable]
  private val reflections = TableQuery[ReflectionsTable]

  def findGroup(groupId: Int): Future[Option[SupportGroup]] = {
    db.run(supportGroups.filter(_.id === groupId).result.headOption)
  }

  def participantsForGroup(groupId: Int): Future[Seq[Participant]] = {
    db.run(
      participants
        .filter(_.groupId === groupId)
        .sortBy(participant => (participant.role.desc, participant.displayName.asc))
        .result
    )
  }

  def groupMessagesForGroup(groupId: Int): Future[Seq[GroupMessage]] = {
    db.run(
      groupMessages
        .filter(message =>
          message.groupId === groupId && message.messageType === "group"
        )
        .sortBy(message => (message.createdAt.asc, message.id.asc))
        .result
    )
  }

  def createGroupMessage(
      groupId: Int,
      request: CreateGroupMessage
  ): Future[GroupMessage] = {
    createMessage(
      groupId = groupId,
      senderName = request.senderName.getOrElse("You"),
      senderRole = "participant",
      body = request.body.trim,
      messageType = "group"
    )
  }

  def createFacilitatorMessage(
      groupId: Int,
      request: CreateFacilitatorMessage
  ): Future[GroupMessage] = {
    createMessage(
      groupId = groupId,
      senderName = request.senderName.getOrElse("You"),
      senderRole = "participant",
      body = request.body.trim,
      messageType = "facilitator_direct"
    )
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

    val insertQuery = (reflections returning reflections.map(_.id)) += reflection

    db.run(insertQuery).flatMap { newId =>
      db.run(reflections.filter(_.id === newId).result.head)
    }
  }

  def shareReflection(reflectionId: Int): Future[Option[Reflection]] = {
    val query = reflections.filter(_.id === reflectionId)
    val updateAction = query
      .map(reflection => (reflection.sharedWithFacilitator, reflection.sharedAt))
      .update((true, Some(LocalDateTime.now())))

    db.run(updateAction).flatMap {
      case 0 => Future.successful(None)
      case _ => db.run(query.result.headOption)
    }
  }

  private def createMessage(
      groupId: Int,
      senderName: String,
      senderRole: String,
      body: String,
      messageType: String
  ): Future[GroupMessage] = {
    val message = GroupMessage(
      id = 0,
      groupId = groupId,
      senderName = senderName,
      senderRole = senderRole,
      body = body,
      messageType = messageType,
      createdAt = LocalDateTime.now()
    )

    val insertQuery = (groupMessages returning groupMessages.map(_.id)) += message

    db.run(insertQuery).flatMap { newId =>
      db.run(groupMessages.filter(_.id === newId).result.head)
    }
  }
}
