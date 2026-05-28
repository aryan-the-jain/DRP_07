"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SupportGroup = {
  id: number;
  name: string;
  facilitatorName: string;
  scheduledDurationMinutes: number;
  createdAt: string;
};

type Participant = {
  id: number;
  groupId: number;
  displayName: string;
  initials: string;
  aboutMe: string;
  funFact: string;
  role: string;
  createdAt: string;
};

type GroupMessage = {
  id: number;
  groupId: number;
  senderName: string;
  senderRole: string;
  body: string;
  messageType: string;
  createdAt: string;
};

const groupId = 1;
const fallbackApiUrl = "http://localhost:9000";

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
    const response = await fetch(`${apiUrl}/groups/${groupId}/messages`);

    if (!response.ok) {
      throw new Error("Could not load messages.");
    }

    const data: GroupMessage[] = await response.json();
    setMessages(
      [...data].sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime() || first.id - second.id,
      ),
    );
  }, [apiUrl]);

  const loadRoom = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [groupResponse, participantsResponse] = await Promise.all([
        fetch(`${apiUrl}/groups/${groupId}`),
        fetch(`${apiUrl}/groups/${groupId}/participants`),
      ]);

      if (!groupResponse.ok || !participantsResponse.ok) {
        throw new Error("Could not load Monday Group.");
      }

      const [groupData, participantsData]: [SupportGroup, Participant[]] =
        await Promise.all([groupResponse.json(), participantsResponse.json()]);

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

  function findParticipantByName(name: string) {
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

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderName: "You",
          senderInitials: "Y",
          body: trimmedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not send message.");
      }

      setMessageBody("");
      await loadMessages();
    } catch {
      setErrorMessage("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f4f1ec] px-4 py-5 text-stone-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8] shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <header className="shrink-0 border-b border-stone-200 bg-[#faf7f1]">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase text-stone-500">
                  Room
                </p>
                <h1 className="text-xl font-semibold text-stone-950 sm:text-2xl">
                  {group?.name ?? "Monday Group"}
                </h1>
              </div>

              <div
                ref={participantListRef}
                className="relative"
                onMouseEnter={() => setIsParticipantListHovered(true)}
                onMouseLeave={() => setIsParticipantListHovered(false)}
                onFocus={() => setIsParticipantListHovered(true)}
              >
                <button
                  type="button"
                  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 focus:border-stone-500 focus:outline-none focus:ring-4 focus:ring-stone-200"
                  aria-expanded={isParticipantListOpen}
                  aria-haspopup="dialog"
                  onClick={() =>
                    setIsParticipantListPinned(
                      (isCurrentlyPinned) => !isCurrentlyPinned,
                    )
                  }
                >
                  {participants.length || 7} people
                </button>

                {isParticipantListOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-2 text-stone-800 shadow-[0_18px_45px_rgba(68,52,35,0.16)]">
                    <div className="flex items-start justify-between gap-3 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-stone-500">
                          In the room
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          Click someone to learn a little about them.
                        </p>
                      </div>

                      {isParticipantListPinned && (
                        <button
                          type="button"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-300 text-base leading-none text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
                          aria-label="Close participant list"
                          onClick={() => setIsParticipantListPinned(false)}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {participants.map((participant) => (
                        <button
                          key={participant.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#faf7f1] focus:bg-[#faf7f1] focus:outline-none"
                          onClick={() => openParticipantProfile(participant)}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-xs font-semibold text-stone-700">
                            {participant.initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-stone-950">
                              {participant.displayName}
                            </span>
                            <span className="block text-xs capitalize text-stone-500">
                              {participant.role}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                {group?.scheduledDurationMinutes ?? 30} mins remaining
              </div>

              <button
                type="button"
                className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Description
              </button>
            </div>

            <button
              type="button"
              className="rounded-2xl border border-stone-300 bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Exit
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-stone-200 px-4 py-3 text-sm text-stone-700 sm:flex-row sm:items-center sm:px-5">
            <span>
              <strong className="font-semibold text-stone-950">
                {group?.facilitatorName ?? "Sean"}
              </strong>{" "}
              is facilitating
            </span>
            <button
              type="button"
              className="w-fit rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Directly message them here
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-[#fffdf8]">
          <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex h-full min-h-[14rem] items-center justify-center text-sm text-stone-500">
                Loading Monday Group...
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-[#faf7f1] p-6 text-center text-sm text-stone-600">
                    No messages yet. You can start gently when you are ready.
                  </div>
                ) : (
                  messages.map((message) => (
                    <article key={message.id} className="flex gap-3 sm:gap-4">
                      <button
                        type="button"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#e6ddcf] focus:outline-none focus:ring-4 focus:ring-stone-200 disabled:cursor-default disabled:hover:border-stone-300 disabled:hover:bg-[#eee6da]"
                        aria-label={`Open ${message.senderName}'s profile`}
                        disabled={!findParticipantByName(message.senderName)}
                        onClick={() => {
                          const participant = findParticipantByName(
                            message.senderName,
                          );

                          if (participant) {
                            openParticipantProfile(participant);
                          }
                        }}
                      >
                        {initialsFor(message.senderName)}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <button
                            type="button"
                            className="text-sm font-semibold text-stone-950 transition hover:text-stone-700 focus:outline-none focus:underline disabled:cursor-default disabled:hover:text-stone-950"
                            disabled={!findParticipantByName(message.senderName)}
                            onClick={() => {
                              const participant = findParticipantByName(
                                message.senderName,
                              );

                              if (participant) {
                                openParticipantProfile(participant);
                              }
                            }}
                          >
                            {message.senderName}
                          </button>
                          <time className="text-xs text-stone-500">
                            {formatMessageTime(message.createdAt)}
                          </time>
                        </div>

                        <div className="w-fit max-w-full rounded-[1.25rem] rounded-tl-sm border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-800 shadow-sm sm:text-base">
                          {message.body}
                        </div>
                      </div>
                    </article>
                  ))
                )}

                <div className="flex justify-center py-4">
                  <button
                    type="button"
                    className="rounded-2xl border border-stone-300 bg-[#faf7f1] px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-[#f5efe6]"
                  >
                    Step into a quiet space to reflect
                  </button>
                </div>
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            )}
          </section>

          {selectedParticipant && (
            <div
              className="absolute inset-0 z-40 flex items-start justify-center bg-stone-950/10 px-4 py-24 sm:items-center sm:py-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="participant-profile-title"
              onClick={() => setSelectedParticipant(null)}
            >
              <article
                className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-5 text-stone-800 shadow-[0_24px_70px_rgba(68,52,35,0.22)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-sm font-semibold text-stone-700">
                      {selectedParticipant.initials}
                    </div>
                    <div>
                      <h2
                        id="participant-profile-title"
                        className="text-lg font-semibold text-stone-950"
                      >
                        {selectedParticipant.displayName}
                      </h2>
                      <p className="text-sm capitalize text-stone-500">
                        {selectedParticipant.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-lg leading-none text-stone-500 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-200"
                    aria-label="Close participant profile"
                    onClick={() => setSelectedParticipant(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <section className="rounded-2xl bg-[#faf7f1] p-4">
                    <h3 className="text-xs font-semibold uppercase text-stone-500">
                      About me
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      {selectedParticipant.aboutMe}
                    </p>
                  </section>

                  <section className="rounded-2xl bg-[#faf7f1] p-4">
                    <h3 className="text-xs font-semibold uppercase text-stone-500">
                      Fun fact
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      {selectedParticipant.funFact}
                    </p>
                  </section>
                </div>
              </article>
            </div>
          )}

          <footer className="shrink-0 border-t border-stone-200 bg-[#faf7f1] px-4 py-4 sm:px-5">
            <form
              onSubmit={handleSendMessage}
              className="mx-auto flex max-w-4xl items-center gap-3"
            >
              <label className="sr-only" htmlFor="message">
                Message
              </label>
              <input
                id="message"
                className="min-h-12 flex-1 rounded-full border border-stone-300 bg-white px-5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
                placeholder="Type message..."
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                disabled={isSending || isLoading}
              />
              <button
                type="submit"
                disabled={isSending || isLoading}
                className="flex h-12 min-w-12 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {isSending ? "..." : "Send"}
              </button>
            </form>

            {errorMessage && (
              <p className="mx-auto mt-3 max-w-4xl text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </footer>
        </div>
      </section>
    </main>
  );
}
