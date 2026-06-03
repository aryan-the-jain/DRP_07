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

case class ReturnReflectionResponse(
    id: Int,
    groupId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime,
    sharedAt: Option[String]
)
