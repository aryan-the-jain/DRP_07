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
  onSaveReflection: () => void;
  onShareReflection: () => void;
};

export function ChatRoom({
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
  onSaveReflection,
  onShareReflection,
}: ChatRoomProps) {
  const facilitatorName = group?.facilitatorName ?? "Sean";

  return (
    <main className="h-screen overflow-hidden bg-[#f4f1ec] px-4 py-5 text-stone-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8] shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
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
            isSavingReflection={isSavingReflection}
            isSharingReflection={isSharingReflection}
            isReflectionSaved={isReflectionSaved}
            isReflectionShared={isReflectionShared}
            quietSpaceError={quietSpaceError}
            onPrivateNoteChange={onPrivateNoteChange}
            onFacilitatorNoteChange={onFacilitatorNoteChange}
            onExitQuietSpace={onExitQuietSpace}
            onSaveReflection={onSaveReflection}
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
              onEnterQuietSpace={() => onSetActiveTab("quiet")}
            />

            {selectedParticipant && (
              <ParticipantProfileModal
                participant={selectedParticipant}
                onClose={onCloseParticipantProfile}
              />
            )}

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
      </section>
    </main>
  );
}
