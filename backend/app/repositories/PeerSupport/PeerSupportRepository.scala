package repositories.PeerSupport // TODO: Should this be in the parent package?

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

// TODO: Sort this out.  It's just yucky.
@Singleton
class PeerSupportRepository @Inject() (executionContext: ExecutionContext) {
  private given ExecutionContext = executionContext

  private val databaseConfig = DatabaseConfig.fromEnvironment()

  private val db = Database.forURL(
    url = databaseConfig.jdbcUrl,
    user = databaseConfig.username,
    password = databaseConfig.password,
    driver = "org.postgresql.Driver"
  )

  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val facilitatorMessages = TableQuery[FacilitatorMessagesTable]
  private val groupMessages = TableQuery[GroupMessagesTable]
  private val reflections = TableQuery[ReflectionsTable]
  private val supportLinks = TableQuery[SupportLinksTable]
  private val meditationPlaylists = TableQuery[MeditationPlaylistsTable]
  private val userDoodles = TableQuery[UserDoodlesTable]

  private val groupQuerier =
    GroupQueries(supportGroups, groupParticipants, participants)
  private val groupMessageQuerier = GroupMessageQueries(groupMessages)
  private val facilitatorMessageQuerier = FacilitatorMessageQueries(
    facilitatorMessages
  )

  def findGroup(groupId: Int): Future[ReturnSupportGroup] =
    db.run(groupQuerier.selectGroup(groupId).result.head)
      .map { case (name, facilitatorName, duration, day, time) =>
        // Day and time live in the DB; expose them as plain strings so the
        // existing Json.writes macro can serialise them without a LocalTime
        // writer (e.g. "FRIDAY", "17:00").
        ReturnSupportGroup(
          name,
          facilitatorName,
          duration,
          day.name(),
          time.toString
        )
      }

  def participantsForGroup(
      groupId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipants(groupId).result)
      .map(_.map(ReturnParticipant.apply))

  def participantInfo(
      participantId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipantInfo(participantId).result)
      .map(_.map(ReturnParticipant.apply))

  def groupMessages(groupId: Int): Future[Seq[ReturnGroupMessage]] =
    db.run(groupMessageQuerier.selectMessagesFromParticipant(groupId).result)
      .map(_.map(ReturnGroupMessage.apply))

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Future[Seq[ReturnFacilitatorMessage]] =
    db.run(
      facilitatorMessageQuerier
        .selectPrivateMessages(groupId, participantId)
        .result
    ).map(_.map(ReturnFacilitatorMessage.apply))

  /* Upsert the participant's reflection for this group: store every section and
     mark guided / free writing as shared with the facilitator independently.
     Sharing is additive — a later draft save never un-shares a shared section.
     The whole save is one DB write, so the caller can treat success as
     "persisted". */
  def createReflection(
      groupId: Int,
      request: CreateReflection
  ): Future[Reflection] = {
    val now = LocalDateTime.now()
    val privateNote = request.privateNote.map(_.trim).filter(_.nonEmpty)
    val facilitatorNote = request.facilitatorNote.map(_.trim).filter(_.nonEmpty)
    val freeWriting = request.freeWriting.map(_.trim).filter(_.nonEmpty)

    val existingQuery = reflections.filter(reflection =>
      reflection.groupId === groupId
        && reflection.participantId === request.participantId
    )

    db.run(existingQuery.result.headOption).flatMap {
      case Some(existing) =>
        val sharedGuided = existing.sharedGuided || request.shareGuided
        val sharedGuidedAt =
          if (request.shareGuided) Some(now) else existing.sharedGuidedAt
        val sharedFreeWriting =
          existing.sharedFreeWriting || request.shareFreeWriting
        val sharedFreeWritingAt =
          if (request.shareFreeWriting) Some(now)
          else existing.sharedFreeWritingAt

        val update = existingQuery
          .map(reflection =>
            (
              reflection.privateNote,
              reflection.facilitatorNote,
              reflection.freeWriting,
              reflection.sharedGuided,
              reflection.sharedGuidedAt,
              reflection.sharedFreeWriting,
              reflection.sharedFreeWritingAt
            )
          )
          .update(
            (
              privateNote,
              facilitatorNote,
              freeWriting,
              sharedGuided,
              sharedGuidedAt,
              sharedFreeWriting,
              sharedFreeWritingAt
            )
          )

        db.run(update)
          .map(_ =>
            existing.copy(
              privateNote = privateNote,
              facilitatorNote = facilitatorNote,
              freeWriting = freeWriting,
              sharedGuided = sharedGuided,
              sharedGuidedAt = sharedGuidedAt,
              sharedFreeWriting = sharedFreeWriting,
              sharedFreeWritingAt = sharedFreeWritingAt
            )
          )

      case None =>
        val reflection = Reflection(
          id = 0,
          groupId = groupId,
          participantId = request.participantId,
          privateNote = privateNote,
          facilitatorNote = facilitatorNote,
          freeWriting = freeWriting,
          sharedGuided = request.shareGuided,
          sharedGuidedAt = if (request.shareGuided) Some(now) else None,
          sharedFreeWriting = request.shareFreeWriting,
          sharedFreeWritingAt =
            if (request.shareFreeWriting) Some(now) else None,
          createdAt = now
        )
        val insert = (reflections returning reflections.map(_.id)) += reflection
        db.run(insert).map(newId => reflection.copy(id = newId))
    }
  }

  /* The participant's reflection for this group, so the quiet space can reload
     their saved draft (and what they have already shared). */
  def latestReflection(
      groupId: Int,
      participantId: Int
  ): Future[Option[Reflection]] =
    db.run(
      reflections
        .filter(reflection =>
          reflection.groupId === groupId
            && reflection.participantId === participantId
        )
        .sortBy(_.createdAt.desc)
        .result
        .headOption
    )

  /* Active facilitator-curated links for a group (plus links shown to all, where
     groupId is null), ordered by sortOrder. Only http(s) URLs are returned so a
     malicious javascript:/data: link can never reach the client. */
  def activeLinksForGroup(groupId: Int): Future[Seq[ReturnSupportLink]] =
    db.run(
      supportLinks
        .filter(_.isActive)
        .sortBy(link => (link.sortOrder.asc, link.id.asc))
        .result
    ).map(_.collect {
      case link if link.groupId.forall(_ == groupId) && isSafeUrl(link.url) =>
        ReturnSupportLink(link.id, link.title, link.url, link.description)
    })

  private def isSafeUrl(url: String): Boolean = {
    val scheme = url.trim.toLowerCase
    scheme.startsWith("http://") || scheme.startsWith("https://")
  }

  /* Active meditation playlists for a group (plus playlists shown to all, where
     groupId is null), ordered by sortOrder. Only genuine Spotify playlist URLs
     are returned, so a non-Spotify or non-playlist link can never reach the
     client. */
  def activeMeditationPlaylists(
      groupId: Int
  ): Future[Seq[ReturnMeditationPlaylist]] =
    db.run(
      meditationPlaylists
        .filter(_.isActive)
        .sortBy(playlist => (playlist.sortOrder.asc, playlist.id.asc))
        .result
    ).map(_.collect {
      case playlist
          if playlist.groupId.forall(_ == groupId)
            && isSpotifyPlaylistUrl(playlist.spotifyUrl) =>
        ReturnMeditationPlaylist(
          playlist.title,
          playlist.description,
          playlist.spotifyUrl,
          playlist.trackCount
        )
    })

  // Accept only https open.spotify.com/playlist/{id} links (optional query).
  private def isSpotifyPlaylistUrl(url: String): Boolean =
    url.trim.matches(
      "^https://open\\.spotify\\.com/playlist/[A-Za-z0-9]+(\\?[^\\s]*)?$"
    )

  /* Save a participant's doodle. Used both for "Keep this" (private) and for
     sharing with the facilitator (sharedWithFacilitator = true) — sharing is just
     a kept doodle with the flag set, mirroring how reflections model sharing. */
  def saveDoodle(groupId: Int, request: CreateDoodle): Future[ReturnDoodle] = {
    val now = LocalDateTime.now()
    val doodle = UserDoodle(
      id = 0,
      participantId = request.participantId,
      groupId = groupId,
      imageData = request.imageData,
      sharedWithFacilitator = request.sharedWithFacilitator,
      createdAt = now,
      updatedAt = now
    )
    val insert = (userDoodles returning userDoodles.map(_.id)) += doodle
    db.run(insert)
      .map(newId =>
        ReturnDoodle(newId, doodle.imageData, doodle.sharedWithFacilitator, now)
      )
  }

  /* The participant's kept doodles for this group, most recent first. Private to
     the participant. */
  def doodlesForParticipant(
      groupId: Int,
      participantId: Int
  ): Future[Seq[ReturnDoodle]] =
    db.run(
      userDoodles
        .filter(doodle =>
          doodle.groupId === groupId
            && doodle.participantId === participantId
        )
        .sortBy(_.createdAt.desc)
        .result
    ).map(
      _.map(doodle =>
        ReturnDoodle(
          doodle.id,
          doodle.imageData,
          doodle.sharedWithFacilitator,
          doodle.createdAt
        )
      )
    )

  def sendGroupMessage(
      groupId: Int,
      message: CreateGroupMessage
  ): Future[Seq[ReturnGroupMessage]] = {
    val query = groupMessageQuerier.insertNewMessage(
      GroupMessage(
        message.participantId,
        groupId,
        message.body,
        LocalDateTime.now()
      )
    )
    db.run(query)
    groupMessages(groupId) // TODO: Get rid
  }

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

  def sendFacilitatorMessage(
      groupId: Int,
      message: CreateFacilitatorMessage
  ): Future[Int] = {
    val query = facilitatorMessageQuerier.insertNewMessage(
      FacilitatorMessage(
        message.fromId,
        message.toId,
        groupId,
        message.body,
        LocalDateTime.now()
      )
    )
    db.run(query)
  }
}
