package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.PeerSupport.Instances.given

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag)
    extends Table[Participant](tag, "participants") {

  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def initials = column[String]("initials")
  def country = column[String]("country") // TODO: Should really be an enum.
  def aboutMe = column[String]("about_me")
  def funFact = column[String]("fun_fact")
  def role = column[Role]("role")

  // Onboarding survey fields (see V7 migration). Kept out of the `*` projection
  // so the existing `Participant` mapping and queries are untouched.
  def pronouns = column[Option[String]]("pronouns")
  def age = column[Option[String]]("age")
  def hobbies = column[Option[String]]("hobbies")
  def culturalBackground = column[Option[String]]("cultural_background")
  def griefRecency = column[Option[String]]("grief_recency")
  def whoLost = column[Option[String]]("who_lost")
  def onboardingStatus = column[String]("onboarding_status")

  def * = (participantId, name, initials, country, aboutMe, funFact, role)
    .mapTo[Participant]
}
