package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*

// TODO: Links ParticipantsTable and SupportGroupsTable (and maybe some of the other two).
class GroupQueries(
  private val groups: TableQuery[SupportGroupsTable],
  private val participants: TableQuery[ParticipantsTable]
) {

}
