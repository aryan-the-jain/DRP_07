package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import models.Role
import Instances.given

// TODO: Links ParticipantsTable and SupportGroupsTable (and maybe some of the other two).
class GroupQueries(
  private val groups: TableQuery[SupportGroupsTable],
  private val groupParticipants: TableQuery[GroupParticipantsTable],
  private val participants: TableQuery[ParticipantsTable],
) {

  // Get all groups the user is in
  // Get the time of the group
  // Get participant info

  /*
  case class SupportGroup(
    groupId: Int,
    name: String,
    day: DayOfWeek,
    time: LocalTime,
)

case class Participant(
    participantId: Int,
    name: String,
    initials: String,
    country: String,
    aboutMe: String,
    funFact: String,
    role: Role,
)

case class GroupParticipants(
    groupId: Int,
    participantId: Int,
)
*/
  // Returns the group id, group name, facilitator name, group conversation duration given groupId.
  def selectGroup(groupId: Int): Query[
    (Rep[Int], Rep[String], Rep[String], Rep[Int]),
    (Int, String, String, Int),
    Seq
  ] = {
    // Arbitrary creation timestamp to satisfy frontend.
    for
      g <- groups if g.groupId === groupId
      gp <- groupParticipants if gp.groupId === g.groupId
      p <- participants if gp.participantId === p.participantId && p.role === Role.FACILITATOR
    yield (g.groupId, g.name, p.name, g.duration)
  }

  def selectParticipants(groupId: Int): Query[
    (Rep[String], Rep[String], Rep[String], Rep[String], Rep[String], Rep[Role]),
    (String, String, String, String, String, Role),
    Seq
  ] = {
    val ps = for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if gp.participantId === p.participantId
    yield (p.name, p.initials, p.country, p.aboutMe, p.funFact, p.role)
    ps.sortBy(p => (p._6.desc, p._1.asc))
  }
}
