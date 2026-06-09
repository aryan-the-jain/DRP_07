package config

import java.net.URI

final case class DatabaseConfig(
    jdbcUrl: String,
    username: String,
    password: String
)

object DatabaseConfig {
  def fromEnvironment(): DatabaseConfig = {
    val databaseUrl = sys.env.get("DATABASE_URL")
      .orElse {
        import java.nio.file.{Files, Paths}
        val envPath = Paths.get(".env")
        if (Files.exists(envPath)) {
          import scala.jdk.CollectionConverters._
          Files.readAllLines(envPath).asScala
            .map(_.trim)
            .find(_.startsWith("DATABASE_URL="))
            .map(_.stripPrefix("DATABASE_URL="))
            .map(_.replaceAll("^\"|\"$|^'|'$", ""))
        } else None
      }
      .getOrElse(
        throw new IllegalStateException(
          "DATABASE_URL environment variable is not set and no .env file was found"
        )
      )

    val uri = new URI(databaseUrl)

    val Array(username, password) = uri.getUserInfo.split(":", 2)

    val jdbcUrl =
      s"jdbc:postgresql://${uri.getHost}:${uri.getPort}${uri.getPath}?sslmode=require"

    DatabaseConfig(
      jdbcUrl = jdbcUrl,
      username = username,
      password = password
    )
  }
}
