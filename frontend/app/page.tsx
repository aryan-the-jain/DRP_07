"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatRoom } from "./components/ChatRoom";
import {
  fallbackApiUrl,
  fetchFacilitatorMessages,
  fetchGroup,
  fetchGroupMessages,
  fetchParticipants,
  groupId,
  saveReflection,
  sendMessage,
  shareReflection,
} from "./lib/api";
import { initialsFor } from "./lib/format";
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
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [isReflectionShared, setIsReflectionShared] = useState(false);
  const [quietSpaceError, setQuietSpaceError] = useState("");
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
    setMessages(await fetchGroupMessages(apiUrl));
  }, [apiUrl]);

  const loadFacilitatorMessages = useCallback(async () => {
    setFacilitatorMessages(await fetchFacilitatorMessages(apiUrl));
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
      await Promise.all([loadMessages(), loadFacilitatorMessages()]);
    } catch {
      setErrorMessage("We could not load the group room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, loadMessages, loadFacilitatorMessages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRoom();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

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

  function findParticipantByName(name: string) {
    const facilitatorName = group?.facilitatorName ?? "Sean";

    if (name.toLowerCase() === facilitatorName.toLowerCase()) {
      return {
        id: 0,
        groupId: groupId,
        displayName: facilitatorName,
        initials: initialsFor(facilitatorName),
        aboutMe:
          "I am facilitating this peer-support group. I am here to help keep this space safe, calm, and supportive for everyone.",
        funFact:
          "I bake bread on weekends and always make sure there is hot tea ready.",
        role: "facilitator",
        createdAt: "",
      };
    }

    return participants.find(
      (participant) =>
        participant.displayName.toLowerCase() === name.toLowerCase(),
    );
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

    const endpoint = activeTab === "group" ? "messages" : "facilitator-messages";

    try {
      await sendMessage(apiUrl, endpoint, trimmedMessage);

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

    if (trimmedPrivate || trimmedFacilitator) {
      try {
        await saveReflection(apiUrl, trimmedPrivate, trimmedFacilitator);
      } catch {
        // Quietly fail since this is a draft save.
      }
    }

    setPrivateNote("");
    setFacilitatorNote("");
    setIsReflectionShared(false);
    setQuietSpaceError("");
    setActiveTab("group");
  }

  async function handleShareReflection() {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();

    if (!trimmedPrivate && !trimmedFacilitator) {
      setQuietSpaceError("Please type something before sharing.");
      return;
    }

    setIsSavingReflection(true);
    setQuietSpaceError("");

    try {
      const reflectionData = await saveReflection(
        apiUrl,
        trimmedPrivate,
        trimmedFacilitator,
      );

      await shareReflection(apiUrl, reflectionData.id);

      setIsReflectionShared(true);
      setPrivateNote("");
      setFacilitatorNote("");
    } catch (error) {
      setIsReflectionShared(false);
      setQuietSpaceError(
        error instanceof Error
          ? error.message
          : "Your reflection could not be shared. Please try again.",
      );
    } finally {
      setIsSavingReflection(false);
    }
  }

  function handleExit() {
    window.close();
  }

  return (
    <ChatRoom
      activeTab={activeTab}
      group={group}
      participants={participants}
      messages={messages}
      facilitatorMessages={facilitatorMessages}
      isLoading={isLoading}
      isSending={isSending}
      errorMessage={errorMessage}
      messageBody={messageBody}
      privateNote={privateNote}
      facilitatorNote={facilitatorNote}
      isSavingReflection={isSavingReflection}
      isReflectionShared={isReflectionShared}
      quietSpaceError={quietSpaceError}
      selectedParticipant={selectedParticipant}
      isParticipantListOpen={isParticipantListOpen}
      isParticipantListPinned={isParticipantListPinned}
      participantListRef={participantListRef}
      messagesEndRef={messagesEndRef}
      findParticipantByName={findParticipantByName}
      onParticipantListHoverChange={setIsParticipantListHovered}
      onParticipantListPinnedChange={setIsParticipantListPinned}
      onOpenParticipantProfile={openParticipantProfile}
      onCloseParticipantProfile={closeParticipantProfile}
      onSetActiveTab={setActiveTab}
      onExit={handleExit}
      onSendMessage={handleSendMessage}
      onMessageBodyChange={setMessageBody}
      onPrivateNoteChange={setPrivateNote}
      onFacilitatorNoteChange={setFacilitatorNote}
      onExitQuietSpace={handleExitQuietSpace}
      onShareReflection={handleShareReflection}
    />
  );
}
