package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class GroupMessagesTable(tag: Tag) extends Table[GroupMessage](tag, "group_messages") {
  // TODO: Encapsulate in GroupMessagesTable.
  private given roleColumnType: BaseColumnType[Role] =
    MappedColumnType.base[Role, String](
      role => role.show,
      {
        case value if value == Role.PARTICIPANT.show => Role.PARTICIPANT
        case value if value == Role.FACILITATOR.show => Role.FACILITATOR
      }
    )

  private given messageColumnType: BaseColumnType[MessageType] =
    MappedColumnType.base[MessageType, String](
      messageType => messageType.show,
      {
        case value if value == MessageType.GROUP_WIDE.show =>
          MessageType.GROUP_WIDE
        case value if value == MessageType.FACILITATOR_DIRECT.show =>
          MessageType.FACILITATOR_DIRECT
      }
    )

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
