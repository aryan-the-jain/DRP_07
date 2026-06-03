package repositories.PeerSupport

import java.time.LocalDateTime
import slick.jdbc.PostgresProfile.api.*

// TODO: Factor out with GroupMessageQueries.
class FacilitatorMessageQueries(private val messagesTable: TableQuery[FacilitatorMessagesTable]) {
  /* Returns the (participantId, the message body, and the time of the message) for all messages
     sent in the group conversation. */
  def selectPrivateMessages(groupId: Int, participantId: Int, facilitatorId: Int): Query[
    (Rep[Int], Rep[String], Rep[LocalDateTime]),
    (Int, String, LocalDateTime),
    Seq
  ] = {
    val messages = for
      m <- messagesTable if m.groupId === groupId && (m.participantId === participantId || m.participantId === facilitatorId)
    yield (m.participantId, m.body, m.createdAt)
    messages.sortBy(m => m._3.asc)
  }
}
