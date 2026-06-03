package models

import play.api.libs.json.*

import java.time.{LocalDateTime, DayOfWeek}
import java.time.format.DateTimeFormatter

object JsonFormats {
  given localDateTimeWrites: Writes[LocalDateTime] =
    Writes(time => JsString(time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))

  given roleWrites: Writes[Role] = Writes(role => JsString(role.show))

  given createSupportRequestReads: Reads[CreateSupportRequest] =
    Json.reads[CreateSupportRequest]

  given supportRequestWrites: Writes[SupportRequest] =
    Json.writes[SupportRequest]

  given dayOfWeekWrites: Writes[DayOfWeek] = Writes(day => JsString(day.name()))

  given supportGroupWrites: Writes[SupportGroup] =
    Json.writes[SupportGroup]

  given participantWrites: Writes[Participant] =
    Json.writes[Participant]

  given createGroupMessageReads: Reads[CreateGroupMessage] =
    Json.reads[CreateGroupMessage]

  given createFacilitatorMessageReads: Reads[CreateFacilitatorMessage] =
    Json.reads[CreateFacilitatorMessage]

  given groupGroupMessageWrites: Writes[GroupMessage] =
    Json.writes[GroupMessage]

  given createReflectionReads: Reads[CreateReflection] =
    Json.reads[CreateReflection]

  given reflectionWrites: Writes[Reflection] =
    Json.writes[Reflection]

  given returnSupportGroupWrites: Writes[ReturnSupportGroup] =
    Json.writes[ReturnSupportGroup]

  given returnParticipantWrites: Writes[ReturnParticipant] =
    Json.writes[ReturnParticipant]

  given returnGroupMessageWrites: Writes[ReturnGroupMessage] =
    Json.writes[ReturnGroupMessage]

  given returnFacilitatorMessageWrites: Writes[ReturnFacilitatorMessage] =
    Json.writes[ReturnFacilitatorMessage]

  given returnReflectionResponse: Writes[ReturnReflectionResponse] =
    Json.writes[ReturnReflectionResponse]

  given updateOnboardingReads: Reads[UpdateOnboarding] =
    Json.reads[UpdateOnboarding]

  given returnOnboardingWrites: Writes[ReturnOnboarding] =
    Json.writes[ReturnOnboarding]
}
