"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatRoom } from "./components/ChatRoom";
import {
  fallbackApiUrl,
  fetchFacilitatorMessages,
  fetchGroup,
  fetchGroupMessages,
  fetchLatestReflection,
  fetchParticipants,
  saveReflection,
  sendMessage,
} from "./lib/api";
import {
  ActiveTab,
  GroupMessage,
  Participant,
  ReflectionShareSelection,
  SupportGroup,
} from "./lib/types";

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
  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isParticipantListHovered, setIsParticipantListHovered] =
    useState(false);
  const [isParticipantListPinned, setIsParticipantListPinned] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [facilitatorMessages, setFacilitatorMessages] = useState<
    GroupMessage[]
  >([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Group);
  const [privateNote, setPrivateNote] = useState("");
  const [facilitatorNote, setFacilitatorNote] = useState("");
  const [freeWritingNote, setFreeWritingNote] = useState("");
  const [shareSelection, setShareSelection] = useState<ReflectionShareSelection>(
    {
      guidedAnswers: false,
      freeWriting: false,
    },
  );
  const [isSharingReflection, setIsSharingReflection] = useState(false);
  const [isReflectionShared, setIsReflectionShared] = useState(false);
  const [quietSpaceError, setQuietSpaceError] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLeftRoom, setHasLeftRoom] = useState(false);
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

  const loadFacilitatorMessages = useCallback(async () => {
    const next = await fetchFacilitatorMessages(apiUrl);
    setFacilitatorMessages((previous) =>
      sameMessages(previous, next) ? previous : next,
    );
  }, [apiUrl]);

  const loadReflectionDraft = useCallback(async () => {
    try {
      const reflection = await fetchLatestReflection(apiUrl);
      if (reflection) {
        setPrivateNote(reflection.privateNote ?? "");
        setFacilitatorNote(reflection.facilitatorNote ?? "");
        setFreeWritingNote(reflection.freeWriting ?? "");
        setShareSelection({
          guidedAnswers: reflection.sharedGuided,
          freeWriting: reflection.sharedFreeWriting,
        });
        setIsReflectionShared(
          reflection.sharedGuided || reflection.sharedFreeWriting,
        );
      }
    } catch {
      // Gracefully ignore since it is just a draft load
    }
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
      await Promise.all([loadMessages(), loadFacilitatorMessages(), loadReflectionDraft()]);
    } catch {
      setErrorMessage("We could not load the group room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, loadMessages, loadFacilitatorMessages, loadReflectionDraft]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRoom();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Poll so other people's messages (and facilitator replies) appear without a
  // manual refresh. Errors are swallowed: a dropped poll just keeps the last
  // good conversation rather than surfacing an error mid-session.
  useEffect(() => {
    if (hasLeftRoom) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadMessages().catch(() => {});
      void loadFacilitatorMessages().catch(() => {});
    }, MESSAGE_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [hasLeftRoom, loadMessages, loadFacilitatorMessages]);

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

    if (hasLeftRoom) {
      return;
    }

    const trimmedMessage = messageBody.trim();

    if (!trimmedMessage) {
      setErrorMessage("Please type a message before sending.");
      return;
    }

    const endpoint =
      activeTab === ActiveTab.Group ? "messages" : "facilitator-messages";
    const facilitatorId = participants.find(
      (participant) => participant.role === "facilitator",
    )?.id;

    if (endpoint === "facilitator-messages" && facilitatorId === undefined) {
      setErrorMessage("Your message could not be sent. Please try again.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      await sendMessage(apiUrl, endpoint, trimmedMessage, facilitatorId);

      setMessageBody("");
      if (activeTab === ActiveTab.Group) {
        await loadMessages();
      } else {
        await loadFacilitatorMessages();
      }
    } catch {
      setErrorMessage("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleExitQuietSpace() {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();
    const trimmedFreeWriting = freeWritingNote.trim();
    const hasAnyText = Boolean(
      trimmedPrivate || trimmedFacilitator || trimmedFreeWriting,
    );

    // Persist whatever they wrote as a private draft (not shared) so it is
    // restored next time. Best-effort: don't block leaving on a failed save.
    if (!isReflectionShared && hasAnyText) {
      try {
        await saveReflection(apiUrl, {
          privateNote: trimmedPrivate,
          facilitatorNote: trimmedFacilitator,
          freeWriting: trimmedFreeWriting,
          shareGuided: false,
          shareFreeWriting: false,
        });
      } catch {
        // Quietly fail since this is a draft save
      }
    }

    setQuietSpaceError("");
    setActiveTab(ActiveTab.Group);
  }

  function handlePrivateNoteChange(value: string) {
    setPrivateNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }

  function handleFacilitatorNoteChange(value: string) {
    setFacilitatorNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }

  function handleFreeWritingNoteChange(value: string) {
    setFreeWritingNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }

  function handleShareSelectionChange(selection: ReflectionShareSelection) {
    setShareSelection(selection);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }

  async function handleShareReflection() {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();
    const trimmedFreeWriting = freeWritingNote.trim();
    const hasGuidedText = Boolean(trimmedPrivate || trimmedFacilitator);
    const hasFreeWritingText = Boolean(trimmedFreeWriting);

    if (!shareSelection.guidedAnswers && !shareSelection.freeWriting) {
      setQuietSpaceError("Choose what you would like to share.");
      return;
    }

    if (
      !(shareSelection.guidedAnswers && hasGuidedText) &&
      !(shareSelection.freeWriting && hasFreeWritingText)
    ) {
      setQuietSpaceError("Please type something in the area you selected.");
      return;
    }

    setIsSharingReflection(true);
    setQuietSpaceError("");

    try {
      // One write persists the text and marks the chosen sections as shared.
      // Only treat it as shared once the backend has actually saved it.
      await saveReflection(apiUrl, {
        privateNote: trimmedPrivate,
        facilitatorNote: trimmedFacilitator,
        freeWriting: trimmedFreeWriting,
        shareGuided: shareSelection.guidedAnswers && hasGuidedText,
        shareFreeWriting: shareSelection.freeWriting && hasFreeWritingText,
      });

      setIsReflectionShared(true);
    } catch {
      setQuietSpaceError(
        "We couldn't share this with the facilitator. Your writing is safe here — please try again.",
      );
    } finally {
      setIsSharingReflection(false);
    }
  }

  function handleExit() {
    setHasLeftRoom(true);
    setSelectedParticipant(null);
    setIsParticipantListHovered(false);
    setIsParticipantListPinned(false);
    setMessageBody("");
  }

  return (
    <ChatRoom
      apiUrl={apiUrl}
      activeTab={activeTab}
      group={group}
      participants={participants}
      messages={messages}
      facilitatorMessages={facilitatorMessages}
      hasLeftRoom={hasLeftRoom}
      isLoading={isLoading}
      isSending={isSending}
      errorMessage={errorMessage}
      messageBody={messageBody}
      privateNote={privateNote}
      facilitatorNote={facilitatorNote}
      freeWritingNote={freeWritingNote}
      shareSelection={shareSelection}
      isSharingReflection={isSharingReflection}
      isReflectionShared={isReflectionShared}
      quietSpaceError={quietSpaceError}
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
      onSetActiveTab={setActiveTab}
      onExit={handleExit}
      onSendMessage={handleSendMessage}
      onMessageBodyChange={setMessageBody}
      onPrivateNoteChange={handlePrivateNoteChange}
      onFacilitatorNoteChange={handleFacilitatorNoteChange}
      onFreeWritingNoteChange={handleFreeWritingNoteChange}
      onShareSelectionChange={handleShareSelectionChange}
      onExitQuietSpace={handleExitQuietSpace}
      onShareReflection={handleShareReflection}
    />
  );
}