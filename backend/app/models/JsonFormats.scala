package models

import play.api.libs.json.*

import java.time.{LocalDateTime, DayOfWeek}
import java.time.format.DateTimeFormatter

object JsonFormats {
  given localDateTimeWrites: Writes[LocalDateTime] =
    Writes(time => JsString(time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))

  given roleWrites: Writes[Role] = Writes(role => JsString(role.show))

  given messageTypeWrites: Writes[MessageType] =
    Writes(messageType => JsString(messageType.show))

  given createSupportRequestReads: Reads[CreateSupportRequest] =
    Json.reads[CreateSupportRequest]

  given supportRequestWrites: Writes[SupportRequest] =
    Json.writes[SupportRequest]

  given dayOfWeekWrites: Writes[DayOfWeek] = Writes(day => JsString(day.name()))

  given supportGroupWrites: Writes[SupportGroup] =
    Json.writes[SupportGroup]

  given participantWrites: Writes[Participant] =
    Json.writes[Participant]

  given createGroupMessageReads: Reads[CreateGroupMessage] = Json.reads[CreateGroupMessage]
  
  given createFacilitatorMessageReads: Reads[CreateFacilitatorMessage] = Json.reads[CreateFacilitatorMessage]

  given groupGroupMessageWrites: Writes[GroupMessage] =
    Json.writes[GroupMessage]

  given createReflectionReads: Reads[CreateReflection] =
    Json.reads[CreateReflection]

  given reflectionWrites: Writes[Reflection] =
    Json.writes[Reflection]
}
