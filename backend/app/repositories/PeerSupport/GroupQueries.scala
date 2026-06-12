package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import slick.sql.FixedSqlAction
import models.*
import repositories.Instances.given

import java.time.{DayOfWeek, LocalDateTime, LocalTime}
import play.api.http.MediaRange.parse
import repositories.tables.{
  SupportGroupsTable,
  GroupParticipantsTable,
  ParticipantsTable
}

class GroupQueries(
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
      gp <- groupParticipants if gp.groupId === g.groupId
      p <- participants
      if gp.participantId === p.participantId && p.role === Role.FACILITATOR
    yield (g.name, p.name, g.duration, g.day, g.time, g.description)
  }

  /* Selects the participant ID of the group facilitator. */
  def selectFacilitator(groupId: Int): Query[(Rep[Int]), Int, Seq] = {
    for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if p.role === Role.FACILITATOR
    yield p.participantId
  }

  /* Returns all of the participants in a group and their (visible) information. */
  def selectParticipants(groupId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[String],
        Rep[Option[String]],
        Rep[List[String]],
        Rep[String],
        Rep[Role]
    ),
    (
        Int,
        String,
        Option[String],
        String,
        Option[String],
        List[String],
        String,
        Role
    ),
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
      p.age,
      p.hobbies,
      p.fact,
      p.role
    )
    ps.sortBy(p => (p._8.desc, p._2.asc))
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
        Rep[Option[String]],
        Rep[List[String]],
        Rep[String],
        Rep[Role]
    ),
    (
        Int,
        String,
        Option[String],
        String,
        Option[String],
        List[String],
        String,
        Role
    ),
    Seq
  ] = {
    for p <- participants if p.participantId === participantId
    yield (
      p.participantId,
      p.name,
      p.pronouns,
      p.initials,
      p.age,
      p.hobbies,
      p.fact,
      p.role
    )
  }

  /* The current session flag together with the schedule and the last close
   * time, so callers can work out whether this week's session already ran. */
  def selectSessionState(groupId: Int): Query[
    (Rep[Boolean], Rep[DayOfWeek], Rep[LocalTime], Rep[Option[LocalDateTime]]),
    (Boolean, DayOfWeek, LocalTime, Option[LocalDateTime]),
    Seq
  ] =
    for g <- groups if g.groupId === groupId
    yield (g.hasSessionNow, g.day, g.time, g.lastSessionEndedAt)

  def startSession(
      groupId: Int
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] =
    groups.filter(_.groupId === groupId).map(_.hasSessionNow).update(true)

  /* Ending a session also records when, which is what locks the room until
   * the next scheduled week. */
  def endSession(
      groupId: Int,
      endedAt: LocalDateTime
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] =
    groups
      .filter(_.groupId === groupId)
      .map(g => (g.hasSessionNow, g.lastSessionEndedAt))
      .update((false, Some(endedAt)))
}
