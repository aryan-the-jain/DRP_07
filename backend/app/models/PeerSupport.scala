package models

import java.time.LocalDateTime

enum Role(val show: String) {
  case PARTICIPANT extends Role("participant")
  case FACILITATOR extends Role("facilitator")
}

enum MessageType(val show: String) {
  case GROUP_WIDE extends MessageType("group")
  case FACILITATOR_DIRECT extends MessageType("facilitator_direct")
}

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

// TODO: Why doesn't this contain a participant ID?
case class GroupMessage(
    id: Int,
    groupId: Int,
    senderName: String,
    senderRole: Role,
    body: String,
    messageType: MessageType,
    createdAt: LocalDateTime
)

case class CreateMessage(
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
