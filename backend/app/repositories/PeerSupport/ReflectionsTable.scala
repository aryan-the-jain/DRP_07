package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime


class ReflectionsTable(tag: Tag) extends Table[Reflection](tag, "reflections") {
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
