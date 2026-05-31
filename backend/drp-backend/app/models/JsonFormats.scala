package models

import play.api.libs.json._

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object JsonFormats {
  implicit val localDateTimeWrites: Writes[LocalDateTime] =
    Writes(time => JsString(time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))

  implicit val createSupportRequestReads: Reads[CreateSupportRequest] =
    Json.reads[CreateSupportRequest]

  implicit val supportRequestWrites: Writes[SupportRequest] =
    Json.writes[SupportRequest]

  implicit val supportGroupWrites: Writes[SupportGroup] =
    Json.writes[SupportGroup]

  implicit val participantWrites: Writes[Participant] =
    Json.writes[Participant]

  implicit val createMessageReads: Reads[CreateMessage] = Json.reads[CreateMessage]

  implicit val groupMessageWrites: Writes[GroupMessage] =
    Json.writes[GroupMessage]

  implicit val createReflectionReads: Reads[CreateReflection] =
    Json.reads[CreateReflection]

  implicit val reflectionWrites: Writes[Reflection] =
    Json.writes[Reflection]
}
