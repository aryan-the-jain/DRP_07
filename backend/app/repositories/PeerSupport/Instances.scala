package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*

import java.time.{DayOfWeek, LocalTime}

object Instances {
  given DayOfWeekColumnType: BaseColumnType[DayOfWeek] =
    MappedColumnType.base[DayOfWeek, String](
      day => day.name(),
      day => DayOfWeek.valueOf(day)
    )

  given hobbiesColumnType: BaseColumnType[List[String]] =
    MappedColumnType.base[List[String], String](
      hobbies => hobbies.mkString(", "),
      hobbies => hobbies.split(", ").toList
    )
}
