package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import models.*
import Instances.given

import java.time.{DayOfWeek, LocalTime}
import play.api.http.MediaRange.parse
import repositories.tables.{
  FacilitatorsTable,
  SupportGroupsTable,
  GroupParticipantsTable,
  ParticipantsTable
}

class GroupQueries(
    private val facilitators: TableQuery[FacilitatorsTable],
    private val groups: TableQuery[SupportGroupsTable],
    private val groupParticipants: TableQuery[GroupParticipantsTable],
    private val participants: TableQuery[ParticipantsTable]
) {
  /* Returns the group name, facilitator name, conversation duration, day and
   * time given groupId. */
  def selectGroup(groupId: Int): Query[
    (
        Rep[String],
        Rep[String],
        Rep[Int],
        Rep[DayOfWeek],
        Rep[LocalTime],
        Rep[Option[String]]
    ),
    (String, String, Int, DayOfWeek, LocalTime, Option[String]),
    Seq
  ] = {
    for
      g <- groups if g.groupId === groupId
      f <- facilitators if f.facilitatorId === g.facilitatorId
    yield (g.name, f.name, g.duration, g.day, g.time, g.description)
  }

  /* Selects the participant ID of the group facilitator. */
  def selectFacilitator(groupId: Int): Query[(Rep[Int]), Int, Seq] = {
    for g <- groups if g.groupId === groupId
    yield g.facilitatorId
  }

  /* Returns all of the participants in a group and their (visible) information. */
  def selectParticipants(groupId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[String],
        Rep[List[String]],
        Rep[String]
    ),
    (Int, String, Option[String], String, List[String], String),
    Seq
  ] = {
    val ps = for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if gp.participantId === p.participantId
    yield (
      p.participantId,
      p.name,
      p.pronouns,
      p.initials,
      p.hobbies,
      p.fact
    )
    ps.sortBy(p => p._2.asc)
  }

  /* Returns the list of all groups that the given user is in. */
  def selectAllGroupsUserIsIn(
      participantId: Int
  ): Query[(Rep[Int]), Int, Seq] = {
    // TODO: Is some ordering required?
    for gp <- groupParticipants if gp.participantId === participantId
    yield gp.groupId
  }

  /* Returns the day, time and duration of the group conversations. */
  def selectTimeOfGroup(groupId: Int): Query[
    (Rep[DayOfWeek], Rep[LocalTime], Rep[Int]),
    (DayOfWeek, LocalTime, Int),
    Seq
  ] = {
    for g <- groups if g.groupId === groupId
    yield (g.day, g.time, g.duration)
  }

  /* Returns the information about a participant given the participantId. */
  def selectParticipantInfo(participantId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[String],
        Rep[List[String]],
        Rep[String]
    ),
    (Int, String, Option[String], String, List[String], String),
    Seq
  ] = {
    for p <- participants if p.participantId === participantId
    yield (
      p.participantId,
      p.name,
      p.pronouns,
      p.initials,
      p.hobbies,
      p.fact
    )
  }
}
