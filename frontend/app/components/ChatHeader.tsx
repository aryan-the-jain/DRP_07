import { RefObject } from "react";

import { ActiveTab, Participant, SupportGroup } from "../lib/types";
import { ParticipantPopover } from "./ParticipantPopover";

type ChatHeaderProps = {
  activeTab: ActiveTab;
  group: SupportGroup | null;
  participants: Participant[];
  isParticipantListOpen: boolean;
  isParticipantListPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  onParticipantListHoverChange: (isHovered: boolean) => void;
  onParticipantListPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
  onSetActiveTab: (activeTab: ActiveTab) => void;
  onExit: () => void;
};

export function ChatHeader({
  activeTab,
  group,
  participants,
  isParticipantListOpen,
  isParticipantListPinned,
  participantListRef,
  onParticipantListHoverChange,
  onParticipantListPinnedChange,
  onOpenParticipantProfile,
  onSetActiveTab,
  onExit,
}: ChatHeaderProps) {
  const facilitatorName = group?.facilitatorName ?? "Sean";

  return (
    <header className="shrink-0 border-b border-stone-200 bg-[#faf7f1]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-stretch sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase text-stone-500">Room</p>
            <h1 className="text-xl font-semibold text-stone-950 sm:text-2xl">
              {group?.name ?? "Friday Group"}
            </h1>
          </div>

          <ParticipantPopover
            participantCount={participants.length}
            participants={participants}
            isOpen={isParticipantListOpen}
            isPinned={isParticipantListPinned}
            participantListRef={participantListRef}
            onHoverChange={onParticipantListHoverChange}
            onPinnedChange={onParticipantListPinnedChange}
            onOpenParticipantProfile={onOpenParticipantProfile}
          />

          <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
            {group?.scheduledDurationMinutes ?? 30} mins remaining
          </div>
        </div>

        <div className="relative group w-fit">
          <button
            type="button"
            onClick={onExit}
            className="cursor-pointer rounded-2xl border border-stone-300 bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-stone-800 active:scale-[0.97]"
          >
            Exit
          </button>
          <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 rounded-xl border border-stone-200 bg-[#faf7f1] shadow-md w-52 text-xs font-normal leading-normal text-stone-600 text-left block">
            Leave the group session. It is safe to step away at any time.
          </span>
        </div>
      </div>

      {activeTab !== "quiet" && (
        <div className="flex flex-col gap-2 border-t border-stone-200 px-4 py-3 text-sm text-stone-700 sm:flex-row sm:items-center sm:px-5">
          <span>
            <strong className="font-semibold text-stone-950">
              {facilitatorName}
            </strong>{" "}
            is facilitating
          </span>
          <div className="relative group w-fit">
            <button
              type="button"
              onClick={() =>
                onSetActiveTab(activeTab === "group" ? "facilitator" : "group")
              }
              className="w-fit rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 cursor-pointer"
            >
              {activeTab === "group"
                ? "Directly message them here"
                : "Go back to group discussion"}
            </button>
            {activeTab === "group" && (
              <span className="absolute top-full mt-2 left-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 rounded-xl border border-stone-200 bg-[#faf7f1] shadow-md w-60 text-xs font-normal leading-normal text-stone-600 text-left block">
                Send a private message to {facilitatorName}, the facilitator. These messages are only seen by you and {facilitatorName}.
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
