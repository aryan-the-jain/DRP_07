package repositories.Onboarding

import config.DatabaseConfig
import slick.jdbc.PostgresProfile.api.*

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.ParticipantsTable
import models.*

// TODO: Factor this out with PeerSupportRepository.
@Singleton
class OnboardingRepository @Inject() (executionContext: ExecutionContext) {
  private given ExecutionContext = executionContext

  private val databaseConfig = DatabaseConfig.fromEnvironment()

  private val db = Database.forURL(
    url = databaseConfig.jdbcUrl,
    user = databaseConfig.username,
    password = databaseConfig.password,
    driver = "org.postgresql.Driver"
  )

  private val participants = TableQuery[ParticipantsTable]

  def onboarding(participantId: Int): Future[Option[ReturnOnboarding]] = {
    val query = participants
      .filter(_.participantId === participantId)
      .map(p =>
        (
          p.participantId,
          p.name,
          p.pronouns,
          p.age,
          p.funFact,
          p.hobbies,
          p.culturalBackground,
          p.griefRecency,
          p.whoLost,
          p.onboardingStatus
        )
      )

    db.run(query.result.headOption).map(_.map(ReturnOnboarding.apply))
  }

  def saveOnboarding(
      participantId: Int,
      data: UpdateOnboarding
  ): Future[Option[ReturnOnboarding]] = {
    val query = participants.filter(_.participantId === participantId)
    val updateAction = query
      .map(p =>
        (
          p.name,
          p.pronouns,
          p.age,
          p.funFact,
          p.hobbies,
          p.culturalBackground,
          p.griefRecency,
          p.whoLost,
          p.onboardingStatus
        )
      )
      .update(
        (
          data.callName,
          data.pronouns,
          data.age,
          data.funFact,
          data.hobbies,
          data.culturalBackground,
          data.griefRecency,
          data.whoLost,
          data.status
        )
      )

    db.run(updateAction).flatMap {
      case 0 => Future.successful(None)
      case _ => onboarding(participantId)
    }
  }
}
