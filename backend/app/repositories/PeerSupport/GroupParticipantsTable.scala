package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

private class GroupParticipantsTable(tag: Tag) extends Table[GroupParticipants](tag, "group_participants") {
  def groupId = column[Int]("group_id", O.PrimaryKey)
  def participantId = column[Int]("participant_id", O.PrimaryKey)

  def * = (groupId, participantId).mapTo[GroupParticipants]
}
