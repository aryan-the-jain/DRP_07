import { FormEvent, RefObject } from "react";

import {
  ActiveTab,
  GroupMessage,
  Participant,
  ReflectionShareSelection,
  SupportGroup,
} from "../lib/types";
import { ChatHeader } from "./ChatHeader";
import { LineIcon } from "./DesignPrimitives";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ParticipantProfileModal } from "./ParticipantProfileModal";
import { QuietReflectionRoom } from "./QuietReflectionRoom";

type ChatRoomProps = {
  apiUrl: string;
  activeTab: ActiveTab;
  group: SupportGroup | null;
  participants: Participant[];
  messages: GroupMessage[];
  facilitatorMessages: GroupMessage[];
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string;
  messageBody: string;
  privateNote: string;
  facilitatorNote: string;
  freeWritingNote: string;
  shareSelection: ReflectionShareSelection;
  isSharingReflection: boolean;
  isReflectionShared: boolean;
  quietSpaceError: string;
  selectedParticipant: Participant | null;
  isParticipantListOpen: boolean;
  isParticipantListPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  findParticipantById: (id: number) => Participant | undefined;
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
  onFreeWritingNoteChange: (value: string) => void;
  onShareSelectionChange: (selection: ReflectionShareSelection) => void;
  onExitQuietSpace: () => void;
  onShareReflection: () => void | Promise<void>;
};

export function ChatRoom({
  apiUrl,
  activeTab,
  group,
  participants,
  messages,
  facilitatorMessages,
  isLoading,
  isSending,
  errorMessage,
  messageBody,
  privateNote,
  facilitatorNote,
  freeWritingNote,
  shareSelection,
  isSharingReflection,
  isReflectionShared,
  quietSpaceError,
  selectedParticipant,
  isParticipantListOpen,
  isParticipantListPinned,
  participantListRef,
  messagesEndRef,
  findParticipantById,
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
  onFreeWritingNoteChange,
  onShareSelectionChange,
  onExitQuietSpace,
  onShareReflection,
}: ChatRoomProps) {
  const facilitatorName = group?.facilitatorName ?? "Sean";

  return (
    <main className="h-screen overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
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
                apiUrl={apiUrl}
                privateNote={privateNote}
                facilitatorNote={facilitatorNote}
                freeWritingNote={freeWritingNote}
                shareSelection={shareSelection}
                isSharingReflection={isSharingReflection}
                isReflectionShared={isReflectionShared}
                quietSpaceError={quietSpaceError}
                onPrivateNoteChange={onPrivateNoteChange}
                onFacilitatorNoteChange={onFacilitatorNoteChange}
                onFreeWritingNoteChange={onFreeWritingNoteChange}
                onShareSelectionChange={onShareSelectionChange}
                onExitQuietSpace={onExitQuietSpace}
                onShareReflection={onShareReflection}
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col bg-card">
                <MessageList
                  activeTab={activeTab}
                  facilitatorName={facilitatorName}
                  messages={messages}
                  facilitatorMessages={facilitatorMessages}
                  isLoading={isLoading}
                  messagesEndRef={messagesEndRef}
                  findParticipantById={findParticipantById}
                  onOpenParticipantProfile={onOpenParticipantProfile}
                />

                {selectedParticipant && (
                  <ParticipantProfileModal
                    participant={selectedParticipant}
                    onClose={onCloseParticipantProfile}
                  />
                )}

                {/* Pinned Quiet Space invitation */}
                <div className="shrink-0 px-4 py-3.5 flex justify-center">
                  <div className="relative group w-fit">
                    <button
                      type="button"
                      onClick={() => onSetActiveTab("quiet")}
                      className="btn calm sm inline-flex items-center gap-2"
                    >
                      <LineIcon name="quiet" size={17} />
                      Step into a quiet space to reflect
                    </button>
                    <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] w-60 text-xs leading-normal text-muted text-center block">
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
      </section>
    </main>
  );
}
