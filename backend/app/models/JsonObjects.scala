package models

import java.time.LocalDateTime

case class ReturnSupportGroup(
    name: String,
    facilitatorName: String,
    scheduledDurationMinutes: Int
)

case class ReturnParticipant(
    id: Int,
    displayName: String,
    initials: String,
    country: String,
    aboutMe: String,
    funFact: String,
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
    age: Option[Int],
    funFact: String,
    hobbies: Option[String],
    culturalBackground: Option[String],
    griefRecency: Option[String],
    whoLost: Option[String],
    status: String
)
