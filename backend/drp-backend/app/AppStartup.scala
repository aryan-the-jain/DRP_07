import config.FlywayMigration

import javax.inject._

@Singleton
final class AppStartup @Inject() (flywayMigration: FlywayMigration) {
  flywayMigration.migrate()
}