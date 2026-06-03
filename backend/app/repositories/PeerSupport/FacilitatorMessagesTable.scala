package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

// TODO: Factor out with GroupMessagesTable.
class FacilitatorMessagesTable(tag: Tag) extends Table[FacilitatorMessage](tag, "facilitator_messages") {
  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Int]("group_id")
  def body = column[String]("body")
  def createdAt = column[LocalDateTime]("created_at")

  def * = (participantId, groupId, body, createdAt).mapTo[FacilitatorMessage]
}

