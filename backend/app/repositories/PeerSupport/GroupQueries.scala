package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import models.*
import Instances.given

import java.time.{DayOfWeek, LocalTime}
import play.api.http.MediaRange.parse

class GroupQueries(
    private val groups: TableQuery[SupportGroupsTable],
    private val groupParticipants: TableQuery[GroupParticipantsTable],
    private val participants: TableQuery[ParticipantsTable]
) {
  /* Returns the group name, facilitator name, group conversation duration given groupId. */
  def selectGroup(groupId: Int): Query[
    (Rep[String], Rep[String], Rep[Int]),
    (String, String, Int),
    Seq
  ] = {
    for
      g <- groups if g.groupId === groupId
      gp <- groupParticipants if gp.groupId === g.groupId
      p <- participants
      if gp.participantId === p.participantId && p.role === Role.FACILITATOR
    yield (g.name, p.name, g.duration)
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
        Rep[String],
        Rep[String],
        Rep[String],
        Rep[String],
        Rep[Role]
    ),
    (Int, String, String, String, String, String, Role),
    Seq
  ] = {
    val ps = for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if gp.participantId === p.participantId
    yield (
      p.participantId,
      p.name,
      p.initials,
      p.country,
      p.aboutMe,
      p.funFact,
      p.role
    )
    ps.sortBy(p => (p._7.desc, p._2.asc))
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

  /* Returns the information about a participant given the groupId and participantId. */
  def selectParticipantInfo(participantId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[String],
        Rep[String],
        Rep[String],
        Rep[String],
        Rep[Role]
    ),
    (Int, String, String, String, String, String, Role),
    Seq
  ] = {
    for p <- participants if p.participantId === participantId
    yield (
      p.participantId,
      p.name,
      p.initials,
      p.country,
      p.aboutMe,
      p.funFact,
      p.role
    )
  }
}
