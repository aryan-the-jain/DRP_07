package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

class GrieversTable(tag: Tag) extends Table[Griever](tag, "grievers") {
  def grieverId = column[Int]("griever_id", O.PrimaryKey)
  def culturalBackground = column[Option[String]]("cultural_background")
  def griefRecency = column[Option[String]]("grief_recency")
  def whoLost = column[Option[String]]("who_lost")
  def onboardingStatus = column[String]("onboarding_status")

  def * = (
    grieverId,
    culturalBackground,
    griefRecency,
    whoLost,
    onboardingStatus
  )
    .mapTo[Griever]
}
