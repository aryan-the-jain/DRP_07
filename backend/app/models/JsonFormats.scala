package models

import play.api.libs.json._

import java.time.LocalDateTime
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

  given supportGroupWrites: Writes[SupportGroup] =
    Json.writes[SupportGroup]

  given participantWrites: Writes[Participant] =
    Json.writes[Participant]

  given createMessageReads: Reads[CreateMessage] = Json.reads[CreateMessage]

  given groupMessageWrites: Writes[GroupMessage] =
    Json.writes[GroupMessage]

  given createReflectionReads: Reads[CreateReflection] =
    Json.reads[CreateReflection]

  given reflectionWrites: Writes[Reflection] =
    Json.writes[Reflection]
}
