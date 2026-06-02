package models

import java.time.LocalDateTime
import java.time.DayOfWeek
import java.time.LocalTime

enum Role(val show: String) {
  case PARTICIPANT extends Role("participant")
  case FACILITATOR extends Role("facilitator")
}

enum MessageType(val show: String) {
  case GROUP_WIDE extends MessageType("group")
  case FACILITATOR_DIRECT extends MessageType("facilitator_direct")
}

case class SupportGroup(
    groupId: Int,
    name: String,
)

case class GroupCalendar(
    groupId: Int,
    day: DayOfWeek,
    time: LocalTime,
)

case class Participant(
    participantId: Int,
    name: String,
    initials: String,
    country: String,
    aboutMe: String,
    funFact: String,
    role: Role,
)

case class GroupParticipants(
    groupId: Int,
    participantId: Int,
)

case class GroupMessage(
    participantId: Int,
    groupId: Int,
    body: String,
    messageType: MessageType, // WHYYYYYYYYY
    createdAt: LocalDateTime
)

// TODO: What is this doing?
case class CreateMessage(
    body: String,
    senderName: Option[String]
)

// TODO: Learn what's going on here.
case class Reflection(
    id: Int,
    groupId: Int, // WHY IT'S PRIVATE!
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
