"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const loadMessages = useCallback(async () => {
    const response = await fetch(`${apiUrl}/groups/${groupId}/messages`);

    if (!response.ok) {
      throw new Error("Could not load messages.");
    }

    const data: GroupMessage[] = await response.json();
    setMessages(data);
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
    <main className="min-h-screen bg-[#f4f1ec] px-4 py-5 text-stone-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8] shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <header className="border-b border-stone-200 bg-[#faf7f1]">
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

              <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                {participants.length || 7} people
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

        <div className="flex flex-1 flex-col bg-[#fffdf8]">
          <section className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex min-h-[22rem] items-center justify-center text-sm text-stone-500">
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-sm font-semibold text-stone-700">
                        {initialsFor(message.senderName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h2 className="text-sm font-semibold text-stone-950">
                            {message.senderName}
                          </h2>
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
              </div>
            )}
          </section>

          <footer className="border-t border-stone-200 bg-[#faf7f1] px-4 py-4 sm:px-5">
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
