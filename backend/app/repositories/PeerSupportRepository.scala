package repositories

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

  private class SupportGroupsTable(tag: Tag)
      extends Table[SupportGroup](tag, "support_groups") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name")
    def facilitatorName = column[String]("facilitator_name")
    def scheduledDurationMinutes = column[Int]("scheduled_duration_minutes")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, name, facilitatorName, scheduledDurationMinutes, createdAt) <> (
        {
          case (
                id,
                name,
                facilitatorName,
                scheduledDurationMinutes,
                createdAt
              ) =>
            SupportGroup(
              id,
              name,
              facilitatorName,
              scheduledDurationMinutes,
              createdAt
            )
        },
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
      (
        id,
        groupId,
        displayName,
        initials,
        aboutMe,
        funFact,
        role,
        createdAt
      ) <> (
        {
          case (
                id,
                groupId,
                displayName,
                initials,
                aboutMe,
                funFact,
                role,
                createdAt
              ) =>
            Participant(
              id,
              groupId,
              displayName,
              initials,
              aboutMe,
              funFact,
              role,
              createdAt
            )
        },
        Participant.unapply
      )
  }

  // TODO: Encapsulate in GroupMessagesTable.
  given roleColumnType: BaseColumnType[Role] =
    MappedColumnType.base[Role, String](
      role => role.show,
      {
        case value if value == Role.PARTICIPANT.show => Role.PARTICIPANT
        case value if value == Role.FACILITATOR.show => Role.FACILITATOR
      }
    )

  given messageColumnType: BaseColumnType[MessageType] =
    MappedColumnType.base[MessageType, String](
      messageType => messageType.show,
      {
        case value if value == MessageType.GROUP_WIDE.show =>
          MessageType.GROUP_WIDE
        case value if value == MessageType.FACILITATOR_DIRECT.show =>
          MessageType.FACILITATOR_DIRECT
      }
    )

  private class GroupMessagesTable(tag: Tag)
      extends Table[GroupMessage](tag, "group_messages") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def groupId = column[Int]("group_id")
    def senderName = column[String]("sender_name")
    def senderRole = column[Role]("sender_role")
    def body = column[String]("body")
    def messageType = column[MessageType]("message_type")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, groupId, senderName, senderRole, body, messageType, createdAt) <> (
        {
          case (
                id,
                groupId,
                senderName,
                senderRole,
                body,
                messageType,
                createdAt
              ) =>
            GroupMessage(
              id,
              groupId,
              senderName,
              senderRole,
              body,
              messageType,
              createdAt
            )
        },
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
        {
          case (
                id,
                groupId,
                privateNote,
                facilitatorNote,
                sharedWithFacilitator,
                createdAt,
                sharedAt
              ) =>
            Reflection(
              id,
              groupId,
              privateNote,
              facilitatorNote,
              sharedWithFacilitator,
              createdAt,
              sharedAt
            )
        },
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
        .sortBy(participant =>
          (participant.role.desc, participant.displayName.asc)
        )
        .result
    )
  }

  def groupMessagesForGroup(groupId: Int): Future[Seq[GroupMessage]] = {
    db.run(
      groupMessages
        .filter(message =>
          message.groupId === groupId && message.messageType === LiteralColumn(
            MessageType.GROUP_WIDE: MessageType
          )
        )
        .sortBy(message => (message.createdAt.asc, message.id.asc))
        .result
    )
  }

  def facilitatorMessagesForGroup(groupId: Int): Future[Seq[GroupMessage]] = {
    db.run(
      groupMessages
        .filter(message =>
          message.groupId === groupId && message.messageType === LiteralColumn(
            MessageType.FACILITATOR_DIRECT: MessageType
          )
        )
        .sortBy(message => (message.createdAt.asc, message.id.asc))
        .result
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
