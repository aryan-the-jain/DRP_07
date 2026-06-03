package repositories.PeerSupport

import java.time.LocalDateTime
import slick.jdbc.PostgresProfile.api.*

class GroupMessageQueries(private val messagesTable: TableQuery[GroupMessagesTable]) {
  /* Returns the (participantId, the message body, and the time of the message) for all messages
     sent in the group conversation. */
  def selectMessagesFromParticipant(groupId: Int): Query[
    (Rep[Int], Rep[String], Rep[LocalDateTime]),
    (Int, String, LocalDateTime),
    Seq
  ] = {
    val messages = for
      m <- messagesTable if m.groupId === groupId
    yield (m.participantId, m.body, m.createdAt)
    messages.sortBy(m => m._3.asc)
  }
}
