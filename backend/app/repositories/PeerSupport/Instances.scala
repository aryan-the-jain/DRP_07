package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import models.Role

import java.time.{DayOfWeek, LocalTime}

object Instances {
  // TODO: Replace with valueOf
  given roleColumnType: BaseColumnType[Role] =
    MappedColumnType.base[Role, String](
      role => role.show,
      {
        case value if value == Role.PARTICIPANT.show => Role.PARTICIPANT
        case value if value == Role.FACILITATOR.show => Role.FACILITATOR
      }
    )
  
  given DayOfWeekColumnType: BaseColumnType[DayOfWeek] =
    MappedColumnType.base[DayOfWeek, String](
      day => day.name(),
      day => DayOfWeek.valueOf(day)
    )
}
