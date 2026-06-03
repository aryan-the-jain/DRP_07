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
  sendFacilitatorMessage,
  sendGroupMessage,
  shareReflection,
} from "./lib/api";
import { ActiveTab, GroupMessage, Participant, SupportGroup } from "./lib/types";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("group");
  const [privateNote, setPrivateNote] = useState("");
  const [facilitatorNote, setFacilitatorNote] = useState("");
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
    setMessages(await fetchGroupMessages(apiUrl));
  }, [apiUrl]);

  const loadFacilitatorMessages = useCallback(async () => {
    setFacilitatorMessages(await fetchFacilitatorMessages(apiUrl));
  }, [apiUrl]);

  const loadReflectionDraft = useCallback(async () => {
    try {
      const reflection = await fetchLatestReflection(apiUrl);
      if (reflection) {
        setPrivateNote(reflection.privateNote ?? "");
        setFacilitatorNote(reflection.facilitatorNote ?? "");
        setIsReflectionShared(reflection.sharedWithFacilitator);
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

  // Messages carry only a sender id, so index the roster by id to resolve names.
  const participantsById = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants],
  );

  // The facilitator's id is needed to send private messages.
  const facilitatorId = useMemo(
    () => participants.find((participant) => participant.role === "facilitator")?.id,
    [participants],
  );

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

  const findParticipantById = useCallback(
    (id: number) => participantsById.get(id),
    [participantsById],
  );

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

    if (activeTab === "facilitator" && facilitatorId === undefined) {
      setErrorMessage("Your message could not be sent. Please try again.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      if (activeTab === "group") {
        await sendGroupMessage(apiUrl, trimmedMessage);
      } else {
        await sendFacilitatorMessage(apiUrl, facilitatorId!, trimmedMessage);
      }

      setMessageBody("");
      if (activeTab === "group") {
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

    if (!isReflectionShared && (trimmedPrivate || trimmedFacilitator)) {
      try {
        await saveReflection(
          apiUrl,
          trimmedPrivate,
          trimmedFacilitator,
        );
      } catch {
        // Quietly fail since this is a draft save
      }
    }

    setQuietSpaceError("");
    setActiveTab("group");
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

  async function handleShareReflection() {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();

    if (!trimmedPrivate && !trimmedFacilitator) {
      setQuietSpaceError("Please type something before sharing.");
      return;
    }

    setIsSharingReflection(true);
    setQuietSpaceError("");

    try {
      const reflectionData = await saveReflection(
        apiUrl,
        trimmedPrivate,
        trimmedFacilitator,
      );
      const reflectionId = reflectionData.id;

      await shareReflection(apiUrl, reflectionId);
      setIsReflectionShared(true);
    } catch {
      setIsReflectionShared(true);
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
      onExitQuietSpace={handleExitQuietSpace}
      onShareReflection={handleShareReflection}
    />
  );
}