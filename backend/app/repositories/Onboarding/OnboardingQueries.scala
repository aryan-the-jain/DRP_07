package repositories.Onboarding

import slick.sql.FixedSqlAction
import slick.jdbc.PostgresProfile.api.*
import models.*
import repositories.Instances.given

import repositories.tables.{GrieversTable, ParticipantsTable}
import scala.concurrent.ExecutionContext

// TODO: What is the difference between fun fact and hobbies?
class OnboardingQueries(
    private val grieversTable: TableQuery[GrieversTable],
    private val participantsTable: TableQuery[ParticipantsTable]
)(using ExecutionContext) {
  def selectAllOnboardingInformation(participantId: Int) = {
    for
      g <- grieversTable if g.grieverId === participantId
      p <- participantsTable if p.participantId === g.grieverId
    yield (
      g.grieverId,
      p.name,
      p.pronouns,
      p.age,
      p.fact,
      p.hobbies,
      g.culturalBackground,
      g.griefRecency,
      g.whoLost
    )
  }

  def insertNewOnboardingInformation(
      participantId: Int,
      update: UpdateOnboarding
  ) = {

    val participantUpdate =
      participantsTable
        .filter(_.participantId === participantId)
        .map(p =>
          (
            p.name,
            p.pronouns,
            p.age,
            p.fact,
            p.hobbies
          )
        )
        .update(
          (
            update.callName,
            update.pronouns,
            update.age,
            update.fact,
            update.hobbies
          )
        )

    val grieverUpdate =
      grieversTable
        .filter(_.grieverId === participantId)
        .map(g =>
          (
            g.culturalBackground,
            g.griefRecency,
            g.whoLost
          )
        )
        .update(
          (
            update.culturalBackground,
            update.griefRecency,
            update.whoLost
          )
        )

    (for {
      p <- participantUpdate
      g <- grieverUpdate
    } yield p + g).transactionally
  }
}
