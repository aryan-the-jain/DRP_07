package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*
import Instances.given

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag) extends Table[Participant](tag, "participants") {

  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def initials = column[String]("initials")
  def country = column[String]("country") // TODO: Should really be an enum.
  def aboutMe = column[String]("about_me")
  def funFact = column[String]("fun_fact")
  def role = column[Role]("role")

  def * = (participantId, name, initials, country, aboutMe, funFact, role).mapTo[Participant]
}
