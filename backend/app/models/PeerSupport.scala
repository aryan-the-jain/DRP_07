package models

import java.time.LocalDateTime
import java.time.DayOfWeek
import java.time.LocalTime

enum Role(val show: String) {
  case PARTICIPANT extends Role("participant")
  case FACILITATOR extends Role("facilitator")
}

case class SupportGroup(
    groupId: Int,
    name: String,
    day: DayOfWeek,
    time: LocalTime,
    duration: Int // TODO: Irontype
)

case class Participant(
    participantId: Int,
    name: String,
    initials: String,
    country: String,
    aboutMe: String,
    funFact: String,
    role: Role
)

case class GroupParticipants(
    groupId: Int,
    participantId: Int
)

case class GroupMessage(
    participantId: Int,
    groupId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class FacilitatorMessage(
    fromId: Int,
    toId: Int,
    groupId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class CreateFacilitatorMessage(
    fromId: Int,
    toId: Int,
    body: String
)

// TODO: What is this doing?
case class CreateGroupMessage(
    participantId: Int,
    body: String
)

/* A participant's quiet-space reflection: guided answers (privateNote +
   facilitatorNote) and free writing. The two sections can be shared with the
   facilitator independently, so the facilitator only ever sees shared sections.
   TODO(next week): facilitator-side view that reads the shared_* sections. */
case class Reflection(
    id: Int,
    groupId: Int,
    participantId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    freeWriting: Option[String],
    sharedGuided: Boolean,
    sharedGuidedAt: Option[LocalDateTime],
    sharedFreeWriting: Boolean,
    sharedFreeWritingAt: Option[LocalDateTime],
    createdAt: LocalDateTime
)

case class CreateReflection(
    participantId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    freeWriting: Option[String],
    shareGuided: Boolean,
    shareFreeWriting: Boolean
)

// Facilitator-curated resource link. A null groupId means it is shown to all.
case class SupportLink(
    id: Int,
    groupId: Option[Int],
    title: String,
    url: String,
    description: Option[String],
    sortOrder: Int,
    isActive: Boolean,
    createdAt: LocalDateTime,
    updatedAt: LocalDateTime
)

// Facilitator-curated meditation playlist. A null groupId means it is shown to all.
case class MeditationPlaylist(
    id: Int,
    groupId: Option[Int],
    title: String,
    description: Option[String],
    spotifyUrl: String,
    trackCount: Option[Int],
    sortOrder: Int,
    isActive: Boolean,
    createdAt: LocalDateTime,
    updatedAt: LocalDateTime
)
