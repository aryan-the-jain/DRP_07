package repositories.tables

import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class FacilitatorGroupNotesTable(tag: Tag)
    extends Table[(Int, String, LocalDateTime)](tag, "facilitator_group_notes") {
  def groupId   = column[Int]("group_id", O.PrimaryKey)
  def notes     = column[String]("notes")
  def updatedAt = column[LocalDateTime]("updated_at")

  def * = (groupId, notes, updatedAt)
}
