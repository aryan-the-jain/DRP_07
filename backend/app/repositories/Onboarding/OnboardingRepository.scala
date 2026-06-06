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
  private val querier = OnboardingQueries(participants)

  def onboarding(participantId: Int): Future[Option[ReturnOnboarding]] = {
    val query = querier.selectAllOnboardingInformation(participantId)
    db.run(query.result.headOption).map(_.map(ReturnOnboarding.apply))
  }

  def saveOnboarding(
      participantId: Int,
      onboardingInfo: UpdateOnboarding
  ): Future[Option[ReturnOnboarding]] = {
    val query =
      querier.insertNewOnboardingInformation(participantId, onboardingInfo)

    db.run(query).flatMap {
      case 0 => Future.successful(None)
      case _ => onboarding(participantId)
    }
  }
}
