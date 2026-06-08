"use client";

import { AvatarCircle, LineIcon } from "../components/DesignPrimitives";
import { formatSessionSchedule } from "../lib/format";
import { participantId } from "../lib/api";
import { Participant, SupportGroup } from "../lib/types";

type ThisWeekCardProps = {
  group: SupportGroup | null;
  participants: Participant[];
  onOpenProfile: (participant: Participant) => void;
  onEnterRoom: () => void;
};

// A single avatar that lifts and reveals its name on hover, and opens the full
// profile on click — shared by the facilitator face and the member row.
function HoverAvatar({
  participant,
  onOpenProfile,
  size = "h-10 w-10 text-sm",
  overlap = false,
}: {
  participant: Participant;
  onOpenProfile: (participant: Participant) => void;
  size?: string;
  overlap?: boolean;
}) {
  const isFacilitator = participant.role === "facilitator";
  // Single-letter initial, matching the design's overlapping faces.
  const initial = participant.displayName.charAt(0).toUpperCase();

  return (
    <div
      className="relative w-fit"
      style={overlap ? { marginLeft: -9 } : undefined}
    >
      <button
        type="button"
        onClick={() => onOpenProfile(participant)}
        className="peer rounded-full transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
        aria-label={`Open ${participant.displayName}'s profile`}
      >
        <AvatarCircle
          initials={initial}
          tone={isFacilitator ? "calm" : "warm"}
          sizeClass={size}
        />
      </button>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 peer-hover:opacity-100 peer-hover:scale-100 transition-all duration-200 ease-out z-50 px-3 py-2 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] whitespace-nowrap text-xs leading-normal text-muted text-center block">
        <span className="font-semibold text-ink">{participant.displayName}</span>
        {isFacilitator ? " · facilitator" : ""}
      </span>
    </div>
  );
}

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
  // "Others" who'll be there — the members excluding the current participant.
  const others = members.filter((p) => p.id !== participantId);

  return (
    <section className="sk v2 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <p className="leader [color:var(--warm)]">
              This week
              {schedule?.dateLabel ? ` · ${schedule.dayLabel} ${schedule.dateLabel}` : ""}
            </p>
            {schedule?.relative && (
              <span className="chip warm px-2.5 py-0.5 text-[12.5px]">
                {schedule.relative}
              </span>
            )}
          </div>
          <h2 className="h-title mt-1 text-2xl text-ink">
            {group?.name ?? "Your group"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[15px] text-muted">
            {schedule?.timeLabel && (
              <span className="flex items-center gap-2">
                <LineIcon name="clock" size={16} className="[color:var(--warm)]" />
                {schedule.timeLabel}
                {group?.scheduledDurationMinutes != null && (
                  <span className="text-muted text-[15px]">
                    · {group.scheduledDurationMinutes} min
                  </span>
                )}
              </span>
            )}
            {facilitator && (
              <span className="flex items-center gap-2">
                held by{" "}
                <HoverAvatar
                  participant={facilitator}
                  onOpenProfile={onOpenProfile}
                  size="h-7 w-7 text-xs"
                />
                <span className="text-ink">{facilitator.displayName}</span>
              </span>
            )}
          </div>
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

      <p className="mt-3 text-[15.5px] leading-relaxed text-ink">
        A small, settled group meeting at a gentle pace — there&apos;s no pressure
        to speak before you&apos;re ready.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-dashed border-line pt-4">
        {members.length > 0 ? (
          <>
            <div className="flex items-center pl-[9px]">
              {members.map((participant) => (
                <HoverAvatar
                  key={participant.id}
                  participant={participant}
                  onOpenProfile={onOpenProfile}
                  size="h-10 w-10 text-sm"
                  overlap
                />
              ))}
            </div>
            <div className="text-[14.5px] text-muted">
              <span className="text-ink">
                {others.length > 0
                  ? `${others.length} ${others.length === 1 ? "other" : "others"}`
                  : "Your group"}
              </span>{" "}
              will be there
              <div className="text-[12.5px] text-faint">
                hover a face to see who&apos;s coming
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            We&apos;ll introduce you to the group soon.
          </p>
        )}
      </div>
    </section>
  );
}
