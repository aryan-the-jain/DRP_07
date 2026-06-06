package models

import java.time.LocalDateTime

case class ReturnSupportGroup(
    name: String,
    facilitatorName: String,
    scheduledDurationMinutes: Int,
    dayOfWeek: String,
    scheduledTime: String
)

case class ReturnParticipant(
    id: Int,
    displayName: String,
    pronouns: Option[String],
    initials: String,
    hobbies: List[String],
    fact: String,
    role: Role
)

case class ReturnGroupMessage(
    id: Int,
    body: String,
    createdAt: LocalDateTime
)

case class ReturnFacilitatorMessage(
    fromId: Int,
    toId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class ReturnSupportLink(
    id: Int,
    title: String,
    url: String,
    description: Option[String]
)

case class ReturnMeditationPlaylist(
    title: String,
    description: Option[String],
    spotifyUrl: String,
    trackCount: Option[Int]
)

case class ReturnDoodle(
    id: Int,
    imageData: String,
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime
)

case class ReturnReflectionResponse(
    id: Int,
    groupId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime,
    sharedAt: Option[String]
)

case class ReturnOnboarding(
    participantId: Int,
    callName: String,
    pronouns: Option[String],
    age: Option[String],
    funFact: String,
    hobbies: List[String],
    culturalBackground: Option[String],
    griefRecency: Option[String],
    whoLost: Option[String],
    status: String
)
