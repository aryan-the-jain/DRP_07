"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandMark, LineIcon } from "../components/DesignPrimitives";
import { MessageComposer } from "../components/MessageComposer";
import { MessageList } from "../components/MessageList";
import { ParticipantProfileModal } from "../components/ParticipantProfileModal";
import {
  fallbackApiUrl,
  fetchFacilitatorMessages,
  fetchGroup,
  fetchParticipants,
  sendMessage,
} from "../lib/api";
import { GroupMessage, Participant, SupportGroup } from "../lib/types";

// A private, one-to-one conversation with the facilitator — reachable from the
// quiet room. It reuses the exact chat interface (message bubbles + composer)
// but without the group-room chrome (participant count, "leave the room"), so
// opening it never feels like joining the session.
const MESSAGE_POLL_INTERVAL_MS = 5000;

export default function FacilitatorMessagePage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [facilitatorMessages, setFacilitatorMessages] = useState<GroupMessage[]>(
    [],
  );
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const facilitatorName = group?.facilitatorName ?? "Sean";

  const loadMessages = useCallback(async () => {
    setFacilitatorMessages(await fetchFacilitatorMessages(apiUrl));
  }, [apiUrl]);

  const load = useCallback(async () => {
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
      setErrorMessage("We couldn't load your conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, loadMessages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [facilitatorMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadMessages().catch(() => {});
    }, MESSAGE_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedParticipant(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

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

    const facilitatorId = participants.find(
      (participant) => participant.role === "facilitator",
    )?.id;
    if (facilitatorId === undefined) {
      setErrorMessage("Your message could not be sent. Please try again.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");
    try {
      await sendMessage(apiUrl, "facilitator-messages", trimmedMessage, facilitatorId);
      setMessageBody("");
      await loadMessages();
    } catch {
      setErrorMessage("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  // Where "back" goes and what it says, based on a ?return= path. Read on the
  // client so the label matches where the visitor came from (Home vs the quiet
  // space). Defaults to the quiet space.
  const [back, setBack] = useState<{ href: string; label: string }>({
    href: "/calm/breathe",
    label: "Back to the quiet space",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const returnTo = new URLSearchParams(window.location.search).get("return");
      const href =
        returnTo && returnTo.startsWith("/") ? returnTo : "/calm/breathe";
      const label = href.startsWith("/dashboard")
        ? "Back to home"
        : "Back to the quiet space";
      setBack({ href, label });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleBack() {
    router.push(back.href);
  }

  return (
    <main className="h-screen overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-line bg-card p-4 sm:p-5">
          <BrandMark />
          <button
            type="button"
            onClick={handleBack}
            className="btn sm inline-flex items-center gap-2"
          >
            <LineIcon name="arrowLeft" size={16} />
            {back.label}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-card">
          <MessageList
            activeTab="facilitator"
            facilitatorName={facilitatorName}
            messages={[]}
            facilitatorMessages={facilitatorMessages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            findParticipantById={findParticipantById}
            onOpenParticipantProfile={setSelectedParticipant}
          />

          {selectedParticipant && (
            <ParticipantProfileModal
              participant={selectedParticipant}
              onClose={() => setSelectedParticipant(null)}
            />
          )}

          <MessageComposer
            activeTab="facilitator"
            facilitatorName={facilitatorName}
            messageBody={messageBody}
            isSending={isSending}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onMessageBodyChange={setMessageBody}
            onSendMessage={handleSendMessage}
          />
        </div>
      </section>
    </main>
  );
}
