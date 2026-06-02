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

  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def day = column[DayOfWeek]("day_of_week")
  def time = column[LocalTime]("time")

  def * = (id, name, day, time).mapTo[SupportGroup]
}
