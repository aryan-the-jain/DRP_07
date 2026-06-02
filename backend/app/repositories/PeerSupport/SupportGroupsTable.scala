package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

private class SupportGroupsTable(tag: Tag) extends Table[SupportGroup](tag, "support_groups") {
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
