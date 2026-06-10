"use client";

import Link from "next/link";

import { AvatarCircle, LineIcon } from "../components/DesignPrimitives";
import { formatSessionSchedule } from "../lib/format";
import { Participant, SupportGroup } from "../lib/types";

type FacilitatorCardProps = {
  group: SupportGroup | null;
  participants: Participant[];
};

// A gentle doorway to a private one-to-one message with the facilitator. Pulls
// the facilitator + group details from the dashboard's existing data so nothing
// is hardcoded; links to the standalone /facilitator conversation.
export function FacilitatorCard({ group, participants }: FacilitatorCardProps) {
  const facilitator = participants.find((p) => p.role === "facilitator");
  const name =
    facilitator?.displayName ?? group?.facilitatorName ?? "your facilitator";
  const firstName = name.split(" ")[0];
  const initial = name.charAt(0).toUpperCase();
  const schedule = formatSessionSchedule(group?.dayOfWeek, group?.scheduledTime);

  return (
    <section className="sk v3 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <AvatarCircle
            initials={initial}
            tone="calm"
            sizeClass="h-12 w-12 text-base"
          />
          <div className="min-w-0">
            <p className="leader [color:var(--calm)]">Your facilitator</p>
            <h2 className="h-title mt-1 text-2xl text-ink">{name}</h2>
            {group?.name && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
                holds <span className="text-ink">{group.name}</span>
                {schedule?.timeLabel && (
                  <span className="flex items-center gap-1.5">
                    <LineIcon
                      name="clock"
                      size={15}
                      className="[color:var(--calm)]"
                    />
                    {schedule.dayLabel} · {schedule.timeLabel}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <Link
          href="/facilitator?return=/dashboard"
          data-metric-id="message-facilitator"
          className="btn calm inline-flex items-center gap-2"
        >
          <LineIcon name="mail" size={16} />
          Message {firstName}
        </Link>
      </div>

      <p className="mt-3 text-[15.5px] leading-relaxed text-ink">
        Something on your mind you&apos;d rather not share with the group? You can
        write to {firstName} privately, just the two of you — whenever you&apos;re
        ready.
      </p>
    </section>
  );
}
