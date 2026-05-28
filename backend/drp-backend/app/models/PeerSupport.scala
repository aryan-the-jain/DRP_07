package models

import java.time.LocalDateTime

case class SupportGroup(
    id: Int,
    name: String,
    facilitatorName: String,
    scheduledDurationMinutes: Int,
    createdAt: LocalDateTime
)

case class Participant(
    id: Int,
    groupId: Int,
    displayName: String,
    initials: String,
    aboutMe: String,
    funFact: String,
    role: String,
    createdAt: LocalDateTime
)

case class GroupMessage(
    id: Int,
    groupId: Int,
    senderName: String,
    senderRole: String,
    body: String,
    messageType: String,
    createdAt: LocalDateTime
)

case class CreateGroupMessage(
    body: String,
    senderName: Option[String]
)

case class CreateFacilitatorMessage(
    body: String,
    senderName: Option[String]
)

case class Reflection(
    id: Int,
    groupId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime,
    sharedAt: Option[LocalDateTime]
)

case class CreateReflection(
    privateNote: Option[String],
    facilitatorNote: Option[String]
)
