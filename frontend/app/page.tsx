"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatRoom } from "./components/ChatRoom";
import { SidebarLayout } from "./components/SidebarLayout";
import {
  fallbackApiUrl,
  fetchGroup,
  fetchGroupMessages,
  fetchParticipants,
  sendMessage,
} from "./lib/api";
import { GroupMessage, Participant, SupportGroup } from "./lib/types";

// How often to refresh the conversation so other people's messages appear
// without a manual refresh. Gentle cadence to match the calm tone.
const MESSAGE_POLL_INTERVAL_MS = 5000;

// Messages carry no stable id, so compare by content to avoid replacing state
// (and re-scrolling) when a poll returns the same conversation.
function sameMessages(a: GroupMessage[], b: GroupMessage[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every(
    (message, index) =>
      message.id === b[index].id &&
      message.body === b[index].body &&
      message.createdAt === b[index].createdAt,
  );
}

export default function Home() {
  const router = useRouter();
  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isParticipantListHovered, setIsParticipantListHovered] =
    useState(false);
  const [isParticipantListPinned, setIsParticipantListPinned] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const participantListRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isParticipantListOpen =
    isParticipantListHovered || isParticipantListPinned;

  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const loadMessages = useCallback(async () => {
    const next = await fetchGroupMessages(apiUrl);
    setMessages((previous) => (sameMessages(previous, next) ? previous : next));
  }, [apiUrl]);

  const loadRoom = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [groupData, participantsData] = await Promise.all([
        fetchGroup(apiUrl),
        fetchParticipants(apiUrl),
      ]);

      setGroup(groupData);
      setParticipants(participantsData);
      await loadMessages();
    } catch {
      setErrorMessage("We could not load the group room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, loadMessages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRoom();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Poll so other people's messages appear without a manual refresh. Errors are
  // swallowed: a dropped poll just keeps the last good conversation rather than
  // surfacing an error mid-session.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadMessages().catch(() => {});
    }, MESSAGE_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsParticipantListHovered(false);
        setIsParticipantListPinned(false);
        setSelectedParticipant(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    function closeParticipantListOnOutsideClick(event: MouseEvent) {
      if (
        isParticipantListPinned &&
        participantListRef.current &&
        !participantListRef.current.contains(event.target as Node)
      ) {
        setIsParticipantListPinned(false);
      }
    }

    document.addEventListener("mousedown", closeParticipantListOnOutsideClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        closeParticipantListOnOutsideClick,
      );
  }, [isParticipantListPinned]);

  function openParticipantProfile(participant: Participant) {
    setSelectedParticipant(participant);
    setIsParticipantListHovered(false);
    setIsParticipantListPinned(false);
  }

  function closeParticipantProfile() {
    setSelectedParticipant(null);
  }

  // FIXED: Shifted lookup logic from names to backend participant IDs
  function findParticipantById(id: number) {
    if (id === undefined || id === null) return undefined;

    return participants.find((p) => p.id === id);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageBody.trim();

    if (!trimmedMessage) {
      setErrorMessage("Please type a message before sending.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      await sendMessage(apiUrl, "messages", trimmedMessage);

      setMessageBody("");
      await loadMessages();
    } catch {
      setErrorMessage("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleExit() {
    // Leaving the room returns the participant to their dashboard home base.
    router.push("/dashboard");
  }

  return (
    <SidebarLayout>
      <ChatRoom
        group={group}
        participants={participants}
        messages={messages}
        isLoading={isLoading}
        isSending={isSending}
        errorMessage={errorMessage}
        messageBody={messageBody}
        selectedParticipant={selectedParticipant}
        isParticipantListOpen={isParticipantListOpen}
        isParticipantListPinned={isParticipantListPinned}
        participantListRef={participantListRef}
        messagesEndRef={messagesEndRef}
        findParticipantById={findParticipantById}
        onParticipantListHoverChange={setIsParticipantListHovered}
        onParticipantListPinnedChange={setIsParticipantListPinned}
        onOpenParticipantProfile={openParticipantProfile}
        onCloseParticipantProfile={closeParticipantProfile}
        onExit={handleExit}
        onSendMessage={handleSendMessage}
        onMessageBodyChange={setMessageBody}
      />
    </SidebarLayout>
  );
}
