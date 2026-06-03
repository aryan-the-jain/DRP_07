import { RefObject } from "react";

import { Participant } from "../lib/types";

type ParticipantPopoverProps = {
  participantCount: number;
  participants: Participant[];
  isOpen: boolean;
  isPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  onHoverChange: (isHovered: boolean) => void;
  onPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
};

export function ParticipantPopover({
  participantCount,
  participants,
  isOpen,
  isPinned,
  participantListRef,
  onHoverChange,
  onPinnedChange,
  onOpenParticipantProfile,
}: ParticipantPopoverProps) {
  return (
    <div
      ref={participantListRef}
      className="relative"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
    >
      <button
        type="button"
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 focus:border-stone-500 focus:outline-none focus:ring-4 focus:ring-stone-200"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => onPinnedChange(!isPinned)}
      >
        {participantCount || 7} people
      </button>

      {isOpen && (
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

            {isPinned && (
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-300 text-base leading-none text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
                aria-label="Close participant list"
                onClick={() => onPinnedChange(false)}
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
                onClick={() => onOpenParticipantProfile(participant)}
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
  );
}
