package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import models.Role

import java.time.{DayOfWeek, LocalTime}

object Instances {
  given roleColumnType: BaseColumnType[Role] =
    MappedColumnType.base[Role, String](
      role => role.show,
      role => Role.valueOf(role)
    )

  given DayOfWeekColumnType: BaseColumnType[DayOfWeek] =
    MappedColumnType.base[DayOfWeek, String](
      day => day.name(),
      day => DayOfWeek.valueOf(day)
    )
}
