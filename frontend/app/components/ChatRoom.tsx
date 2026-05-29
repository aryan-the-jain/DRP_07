import { FormEvent, RefObject } from "react";

import { ActiveTab, GroupMessage, Participant, SupportGroup } from "../lib/types";
import { ChatHeader } from "./ChatHeader";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ParticipantProfileModal } from "./ParticipantProfileModal";
import { QuietReflectionRoom } from "./QuietReflectionRoom";

type ChatRoomProps = {
  activeTab: ActiveTab;
  group: SupportGroup | null;
  participants: Participant[];
  messages: GroupMessage[];
  facilitatorMessages: GroupMessage[];
  hasLeftRoom: boolean;
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string;
  messageBody: string;
  privateNote: string;
  facilitatorNote: string;
  isSavingReflection: boolean;
  isSharingReflection: boolean;
  isReflectionSaved: boolean;
  isReflectionShared: boolean;
  quietSpaceError: string;
  selectedParticipant: Participant | null;
  isParticipantListOpen: boolean;
  isParticipantListPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  findParticipantByName: (name: string) => Participant | undefined;
  onParticipantListHoverChange: (isHovered: boolean) => void;
  onParticipantListPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
  onCloseParticipantProfile: () => void;
  onSetActiveTab: (activeTab: ActiveTab) => void;
  onExit: () => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onMessageBodyChange: (value: string) => void;
  onPrivateNoteChange: (value: string) => void;
  onFacilitatorNoteChange: (value: string) => void;
  onExitQuietSpace: () => void;
  onShareReflection: () => void;
};

export function ChatRoom({
  activeTab,
  group,
  participants,
  messages,
  facilitatorMessages,
  hasLeftRoom,
  isLoading,
  isSending,
  errorMessage,
  messageBody,
  privateNote,
  facilitatorNote,
  isSavingReflection,
  isSharingReflection,
  isReflectionSaved,
  isReflectionShared,
  quietSpaceError,
  selectedParticipant,
  isParticipantListOpen,
  isParticipantListPinned,
  participantListRef,
  messagesEndRef,
  findParticipantByName,
  onParticipantListHoverChange,
  onParticipantListPinnedChange,
  onOpenParticipantProfile,
  onCloseParticipantProfile,
  onSetActiveTab,
  onExit,
  onSendMessage,
  onMessageBodyChange,
  onPrivateNoteChange,
  onFacilitatorNoteChange,
  onExitQuietSpace,
  onShareReflection,
}: ChatRoomProps) {
  const facilitatorName = group?.facilitatorName ?? "Sean";
  const groupName = group?.name ?? "Friday Group";

  return (
    <main className="h-screen overflow-hidden bg-[#f4f1ec] px-4 py-5 text-stone-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8] shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        {hasLeftRoom ? (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-[#fffdf8] p-6 text-center">
            <div className="max-w-md rounded-2xl border border-stone-200 bg-white px-6 py-7 shadow-sm">
              <h1 className="font-serif text-2xl font-semibold text-stone-950">
                You&apos;ve left {groupName}.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Thank you for taking part. It&apos;s safe to close this tab when
                you&apos;re ready.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader
              activeTab={activeTab}
              group={group}
              participants={participants}
              isParticipantListOpen={isParticipantListOpen}
              isParticipantListPinned={isParticipantListPinned}
              participantListRef={participantListRef}
              onParticipantListHoverChange={onParticipantListHoverChange}
              onParticipantListPinnedChange={onParticipantListPinnedChange}
              onOpenParticipantProfile={onOpenParticipantProfile}
              onSetActiveTab={onSetActiveTab}
              onExit={onExit}
            />

            {activeTab === "quiet" ? (
          <QuietReflectionRoom
            privateNote={privateNote}
            facilitatorNote={facilitatorNote}
            isSharingReflection={isSharingReflection}
            isReflectionShared={isReflectionShared}
            quietSpaceError={quietSpaceError}
            onPrivateNoteChange={onPrivateNoteChange}
            onFacilitatorNoteChange={onFacilitatorNoteChange}
            onExitQuietSpace={onExitQuietSpace}
            onShareReflection={onShareReflection}
          />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col bg-[#fffdf8]">
                <MessageList
                  activeTab={activeTab}
                  facilitatorName={facilitatorName}
                  messages={messages}
                  facilitatorMessages={facilitatorMessages}
                  isLoading={isLoading}
                  messagesEndRef={messagesEndRef}
                  findParticipantByName={findParticipantByName}
                  onOpenParticipantProfile={onOpenParticipantProfile}
                />

                {selectedParticipant && (
                  <ParticipantProfileModal
                    participant={selectedParticipant}
                    onClose={onCloseParticipantProfile}
                  />
                )}

                {/* Pinned Quiet Space button bar */}
                <div className="shrink-0 border-t border-stone-200/60 bg-[#fffdf8] py-3.5 flex justify-center">
                  <div className="relative group w-fit">
                    <button
                      type="button"
                      onClick={() => onSetActiveTab("quiet")}
                      className="rounded-2xl border border-stone-300 bg-[#faf7f1] px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-[#f5efe6] cursor-pointer"
                    >
                      Step into a quiet space to reflect
                    </button>
                    <span className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 rounded-xl border border-stone-200 bg-[#faf7f1] shadow-md w-60 text-xs font-normal leading-normal text-stone-600 text-center block">
                      Take a pause from the conversation. You can write your thoughts down freely and privately here.
                    </span>
                  </div>
                </div>

                <MessageComposer
                  activeTab={activeTab}
                  facilitatorName={facilitatorName}
                  messageBody={messageBody}
                  isSending={isSending}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  onMessageBodyChange={onMessageBodyChange}
                  onSendMessage={onSendMessage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
