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
}