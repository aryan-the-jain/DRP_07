package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

private class SupportGroupsTable(tag: Tag) extends Table[SupportGroup](tag, "support_groups") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")

  def * = (id, name).mapTo[SupportGroup]
}
