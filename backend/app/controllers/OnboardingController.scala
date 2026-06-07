package controllers

import models.*
import models.JsonFormats.given
import play.api.mvc.*
import play.api.libs.json.*
import repositories.Onboarding.OnboardingRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class OnboardingController @Inject() (
    cc: ControllerComponents,
    onboardingRepository: OnboardingRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {
  /* Returns the saved onboarding survey answers for a participant so the survey
     Returns the saved object or JSON null. */
  def onboarding(participantId: Int): Action[AnyContent] = Action.async {
    onboardingRepository
      .onboarding(participantId)
      .map(result => Ok(Json.toJson(result)))
  }

  /* Saves the onboarding survey (a "draft" on "save & come back later", or
     "complete" on finish).  Drafts are lenient; a complete submission must carry
     a call name and an age. */
  def saveOnboarding(participantId: Int): Action[JsValue] = createNew(
    onboardingRepository.saveOnboarding(participantId, _),
    (onboarding: UpdateOnboarding) => isValidOnboarding(onboarding)
  )

  private def isValidOnboarding(onboarding: UpdateOnboarding): Boolean =
    onboarding.status match {
      case "draft"    => true
      case "complete" =>
        onboarding.callName.trim.nonEmpty && onboarding.age.isDefined
      case _ => false
    }
}
