package repositories.PeerSupport

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag) extends Table[Participant](tag, "participants") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Int]("group_id")
  def displayName = column[String]("display_name")
  def initials = column[String]("initials")
  def aboutMe = column[String]("about_me")
  def funFact = column[String]("fun_fact")
  def role = column[String]("role")
  def createdAt = column[LocalDateTime]("created_at")

  def * =
    (
      id,
      groupId,
      displayName,
      initials,
      aboutMe,
      funFact,
      role,
      createdAt
    ) <> (
      {
        case (
              id,
              groupId,
              displayName,
              initials,
              aboutMe,
              funFact,
              role,
              createdAt
            ) =>
          Participant(
            id,
            groupId,
            displayName,
            initials,
            aboutMe,
            funFact,
            role,
            createdAt
          )
      },
      Participant.unapply
    )
}
