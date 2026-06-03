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
