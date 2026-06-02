package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalTime
import java.time.DayOfWeek

private class SupportGroupsTable(tag: Tag) extends Table[SupportGroup](tag, "support_groups") {
  private given DayOfWeekColumnType: BaseColumnType[DayOfWeek] =
    MappedColumnType.base[DayOfWeek, String](
      day => day.name(),
      day => DayOfWeek.valueOf(day)
    )

  def groupId = column[Int]("group_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def day = column[DayOfWeek]("day_of_week")
  def time = column[LocalTime]("time")
  def duration = column[Int]("duration")

  def * = (groupId, name, day, time, duration).mapTo[SupportGroup]
}
