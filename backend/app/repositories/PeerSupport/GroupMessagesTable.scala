package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class GroupMessagesTable(tag: Tag) extends Table[GroupMessage](tag, "group_messages") {
  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Int]("group_id")
  def body = column[String]("body")
  def createdAt = column[LocalDateTime]("created_at")

  def * = (participantId, groupId, body, createdAt).mapTo[GroupMessage]
}
