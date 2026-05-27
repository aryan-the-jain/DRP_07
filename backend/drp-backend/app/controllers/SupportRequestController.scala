package controllers

import models.CreateSupportRequest
import models.JsonFormats._
import play.api.libs.json._
import play.api.mvc._
import repositories.SupportRequestRepository

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class SupportRequestController @Inject() (
    cc: ControllerComponents,
    supportRequestRepository: SupportRequestRepository
)(implicit executionContext: ExecutionContext)
    extends AbstractController(cc) {

  def index: Action[AnyContent] = Action.async {
    supportRequestRepository.all().map { requests =>
      Ok(Json.toJson(requests))
    }
  }

  def create: Action[JsValue] = Action.async(parse.json) { request =>
    request.body.validate[CreateSupportRequest] match {
      case JsSuccess(createSupportRequest, _) =>
        supportRequestRepository.create(createSupportRequest).map { savedRequest =>
          Created(Json.toJson(savedRequest))
        }

      case JsError(errors) =>
        Future.successful(BadRequest(Json.obj("error" -> JsError.toJson(errors))))
    }
  }
}