// package controllers

// import models.*
// import models.JsonFormats.given
// import play.api.libs.json.*
// import play.api.mvc.*
// import repositories.PeerSupport.PeerSupportRepository

// import javax.inject.*
// import scala.concurrent.{ExecutionContext, Future}

// @Singleton
// abstract class Controller(
//   cc: ControllerComponents,
//   repository: Repository,
//   executionContext: ExecutionContext
// ) {
//   private given ExecutionContext = executionContext

//   extension [A](req: Future[A])
//     def returnOk()(using Writes[A]): Action[AnyContent] = Action.async {
//       req.map(v => Ok(Json.toJson(v)))
//     }
// }
