import { RefObject } from "react";

import { ActiveTab, Participant, SupportGroup } from "../lib/types";
import { BrandMark, LineIcon } from "./DesignPrimitives";
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

  const isFacilitatorTab = activeTab === "facilitator";

  return (
    <header className="shrink-0 border-b-2 border-dashed border-line bg-card">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <BrandMark />
          <span className="hidden h-7 w-px bg-line sm:block" aria-hidden="true" />
          <div>
            <p className="leader">Today&apos;s room</p>
            <h1 className="h-title text-2xl text-ink sm:text-[28px]">
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

          <span className="chip">
            <LineIcon name="clock" size={15} />
            {group?.scheduledDurationMinutes ?? 30} mins together
          </span>
        </div>

        <div className="relative group w-fit">
          <button type="button" onClick={onExit} className="btn ghost sm">
            Leave the room
          </button>
          <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] w-52 text-xs leading-normal text-muted text-left block">
            Leave the group session. It is safe to step away at any time.
          </span>
        </div>
      </div>

<<<<<<< HEAD
      {activeTab !== ActiveTab.Quiet && (
        <div className="flex flex-col gap-2 border-t border-stone-200 px-4 py-3 text-sm text-stone-700 sm:flex-row sm:items-center sm:px-5">
          <span>
            <strong className="font-semibold text-stone-950">
              {facilitatorName}
            </strong>{" "}
            is facilitating
=======
      {activeTab !== "quiet" && (
        <div className="flex flex-col gap-2.5 border-t-2 border-dashed border-line px-4 py-3 text-[15px] text-muted sm:flex-row sm:items-center sm:px-5">
          <span className="flex items-center gap-2">
            <span className="av calm h-7 w-7 text-xs" aria-hidden="true">
              {facilitatorName.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong className="font-semibold text-ink">
                {facilitatorName}
              </strong>{" "}
              is holding this space
            </span>
>>>>>>> main
          </span>
          <button
            type="button"
            onClick={() =>
<<<<<<< HEAD
              onSetActiveTab(
                activeTab === ActiveTab.Group
                  ? ActiveTab.Facilitator
                  : ActiveTab.Group,
              )
=======
              onSetActiveTab(isFacilitatorTab ? "group" : "facilitator")
>>>>>>> main
            }
            className={`btn sm inline-flex w-fit items-center gap-2 ${isFacilitatorTab ? "" : "warm"}`}
          >
<<<<<<< HEAD
            {activeTab === ActiveTab.Group
              ? "Directly message facilitator here"
              : "Go back to group discussion"}
=======
            {isFacilitatorTab ? (
              <>
                <LineIcon name="arrowLeft" size={15} />
                Back to the group
              </>
            ) : (
              <>
                <LineIcon name="mail" size={15} />
                Message {facilitatorName} privately
              </>
            )}
>>>>>>> main
          </button>
        </div>
      )}
    </header>
  );
}
