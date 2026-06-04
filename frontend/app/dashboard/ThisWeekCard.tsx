"use client";

import { AvatarCircle, LineIcon } from "../components/DesignPrimitives";
import { formatSessionSchedule } from "../lib/format";
import { Participant, SupportGroup } from "../lib/types";

type ThisWeekCardProps = {
  group: SupportGroup | null;
  participants: Participant[];
  onOpenProfile: (participant: Participant) => void;
  onEnterRoom: () => void;
};

// The upcoming-session card. Shows the group, its (DB-derived) date and time,
// and the people in it — each avatar is hoverable for a name and clickable for
// the full About me / Fun fact profile, mirroring the chat room.
export function ThisWeekCard({
  group,
  participants,
  onOpenProfile,
  onEnterRoom,
}: ThisWeekCardProps) {
  const schedule = formatSessionSchedule(group?.dayOfWeek, group?.scheduledTime);
  const facilitator = participants.find((p) => p.role === "facilitator");
  const members = participants.filter((p) => p.role !== "facilitator");

  return (
    <section className="sk soft v2 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="leader [color:var(--warm)]">This week</p>
          <h2 className="h-title mt-1 text-2xl text-ink">
            {group?.name ?? "Your group"}
          </h2>
          {schedule && (
            <p className="mt-1 flex items-center gap-2 text-[15px] text-muted">
              <LineIcon name="clock" size={15} />
              {schedule.full}
            </p>
          )}
          {group && (
            <p className="mt-0.5 text-sm text-muted">
              {group.scheduledDurationMinutes} minutes together
              {facilitator ? `, with ${facilitator.displayName}` : ""}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onEnterRoom}
          className="btn warm inline-flex items-center gap-2"
        >
          <LineIcon name="people" size={16} />
          Step into the room
        </button>
      </div>

      <div className="mt-5 border-t-2 border-dashed border-line pt-4">
        <p className="text-sm text-muted">
          {members.length > 0
            ? "The people who will be here with you:"
            : "We'll introduce you to the group soon."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {participants.map((participant) => {
            const isFacilitator = participant.role === "facilitator";
            return (
              <div key={participant.id} className="relative group w-fit">
                <button
                  type="button"
                  onClick={() => onOpenProfile(participant)}
                  className="rounded-full transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
                  aria-label={`Open ${participant.displayName}'s profile`}
                >
                  <AvatarCircle
                    initials={participant.initials}
                    tone={isFacilitator ? "calm" : "warm"}
                    sizeClass="h-11 w-11 text-sm"
                  />
                </button>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 px-3 py-2 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] whitespace-nowrap text-xs leading-normal text-muted text-center block">
                  <span className="font-semibold text-ink">
                    {participant.displayName}
                  </span>
                  {isFacilitator ? " · facilitator" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
