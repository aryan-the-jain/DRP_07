package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.PeerSupport.Instances.given

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag)
    extends Table[Participant](tag, "participants") {

  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def pronouns = column[Option[String]]("pronouns")
  def initials = column[String]("initials")
  def age = column[Option[String]]("age")
  def culturalBackground = column[Option[String]]("cultural_background")
  def hobbies = column[List[String]]("hobbies")
  def fact = column[String]("fact")
  def griefRecency = column[Option[String]]("grief_recency")
  def whoLost = column[Option[String]]("who_lost")
  def onboardingStatus = column[String]("onboarding_status")

  def * = (
    participantId,
    name,
    pronouns,
    initials,
    age,
    culturalBackground,
    hobbies,
    fact,
    griefRecency,
    whoLost,
    onboardingStatus
  )
    .mapTo[Participant]
}
