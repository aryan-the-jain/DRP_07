import { RefObject } from "react";

import { formatMessageTime, initialsFor } from "../lib/format";
import { ActiveTab, GroupMessage, Participant } from "../lib/types";
import { FacilitatorMessageModal } from "./FacilitatorMessageModal";

type MessageListProps = {
  activeTab: Exclude<ActiveTab, "quiet">;
  facilitatorName: string;
  messages: GroupMessage[];
  facilitatorMessages: GroupMessage[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  findParticipantByName: (name: string) => Participant | undefined;
  onOpenParticipantProfile: (participant: Participant) => void;
};

export function MessageList({
  activeTab,
  facilitatorName,
  messages,
  facilitatorMessages,
  isLoading,
  messagesEndRef,
  findParticipantByName,
  onOpenParticipantProfile,
}: MessageListProps) {
  const visibleMessages = activeTab === "group" ? messages : facilitatorMessages;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="flex h-full min-h-[14rem] items-center justify-center text-sm text-stone-500">
          Loading Friday Group...
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {activeTab === "facilitator" && (
            <FacilitatorMessageModal facilitatorName={facilitatorName} />
          )}

          {visibleMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-[#faf7f1] p-6 text-center text-sm text-stone-600">
              {activeTab === "group"
                ? "No messages yet. You can start gently when you are ready."
                : `No private messages yet. You can write to ${facilitatorName} here when you are ready.`}
            </div>
          ) : (
            visibleMessages.map((message) => {
              const participant = findParticipantByName(message.senderName);

              return (
                <article key={message.id} className="flex gap-3 sm:gap-4">
                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#e6ddcf] focus:outline-none focus:ring-4 focus:ring-stone-200 disabled:cursor-default disabled:hover:border-stone-300 disabled:hover:bg-[#eee6da]"
                    aria-label={`Open ${message.senderName}'s profile`}
                    disabled={!participant}
                    onClick={() => {
                      if (participant) {
                        onOpenParticipantProfile(participant);
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
                        disabled={!participant}
                        onClick={() => {
                          if (participant) {
                            onOpenParticipantProfile(participant);
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
              );
            })
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
