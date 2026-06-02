package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag) extends Table[Participant](tag, "participants") {
  private given roleColumnType: BaseColumnType[Role] =
    MappedColumnType.base[Role, String](
      role => role.show,
      {
        case value if value == Role.PARTICIPANT.show => Role.PARTICIPANT
        case value if value == Role.FACILITATOR.show => Role.FACILITATOR
      }
    )

  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def initials = column[String]("initials")
  def country = column[String]("country") // TODO: Should really be an enum.
  def aboutMe = column[String]("about_me")
  def funFact = column[String]("fun_fact")
  def role = column[Role]("role")

  def * = (participantId, name, initials, country, aboutMe, funFact, role).mapTo[Participant]
}
