package repositories.Onboarding

import slick.sql.FixedSqlAction
import slick.jdbc.PostgresProfile.api.*
import models.*
import repositories.PeerSupport.Instances.given

import repositories.tables.ParticipantsTable

// TODO: What is the difference between fun fact and hobbies?
class OnboardingQueries(
    private val participantsTable: TableQuery[ParticipantsTable]
) {
  def selectAllOnboardingInformation(participantId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[Option[String]],
        Rep[String],
        Rep[List[String]],
        Rep[Option[String]],
        Rep[Option[String]],
        Rep[Option[String]],
        Rep[String]
    ),
    (
        Int,
        String,
        Option[String],
        Option[String],
        String,
        List[String],
        Option[String],
        Option[String],
        Option[String],
        String
    ),
    Seq
  ] = {
    for p <- participantsTable if p.participantId === participantId
    yield (
      p.participantId,
      p.name,
      p.pronouns,
      p.age,
      p.fact,
      p.hobbies,
      p.culturalBackground,
      p.griefRecency,
      p.whoLost,
      p.onboardingStatus
    )
  }

  def insertNewOnboardingInformation(
      participantId: Int,
      update: UpdateOnboarding
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] = {
    participantsTable
      .filter(_.participantId === participantId)
      .map(p =>
        (
          p.name,
          p.pronouns,
          p.age,
          p.fact,
          p.hobbies,
          p.culturalBackground,
          p.griefRecency,
          p.whoLost,
          p.onboardingStatus
        )
      )
      .update(
        (
          update.callName,
          update.pronouns,
          update.age,
          update.fact,
          update.hobbies,
          update.culturalBackground,
          update.griefRecency,
          update.whoLost,
          update.status
        )
      )
  }
}
