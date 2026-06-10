package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

class FacilitatorsTable(tag: Tag)
    extends Table[Facilitator](tag, "facilitators") {
  def facilitatorId = column[Int]("facilitator_id")
  def name = column[String]("name")
  def initials = column[String]("initials")
  def fact = column[String]("fact")
  def pronouns = column[String]("pronouns")
  def age = column[String]("age")
  def hobbies = column[String]("hobbies")

  def * = (facilitatorId, name, initials, fact, pronouns, age, hobbies)
    .mapTo[Facilitator]
}
