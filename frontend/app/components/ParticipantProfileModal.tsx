import { Participant } from "../lib/types";
import { AvatarCircle, LineIcon } from "./DesignPrimitives";

type ParticipantProfileModalProps = {
  participant: Participant;
  onClose: () => void;
};

export function ParticipantProfileModal({
  participant,
  onClose,
}: ParticipantProfileModalProps) {
  const isFacilitator = participant.role === "facilitator";

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-[rgba(58,52,45,0.18)] px-4 py-24 sm:items-center sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-profile-title"
      onClick={onClose}
    >
      <article
        className="sk w-full max-w-md bg-card p-6 text-ink shadow-[0_24px_70px_rgba(58,52,45,0.28)] animate-fadeIn"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarCircle
              initials={participant.initials}
              tone={isFacilitator ? "calm" : "warm"}
              sizeClass="h-12 w-12 text-base"
            />
            <div>
              <h2
                id="participant-profile-title"
                className="h-title text-2xl text-ink"
              >
                {participant.displayName}
              </h2>
              <p className="text-sm capitalize text-muted">
                {participant.role}
              </p>
              {(participant.pronouns || participant.age) && (
                <p className="mt-0.5 text-sm text-muted">
                  {[participant.pronouns, participant.age]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-ink hover:bg-warm-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
            aria-label="Close participant profile"
            onClick={onClose}
          >
            <LineIcon name="close" size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <section className="sk thin soft v2 bg-paper p-4">
            <h3 className="leader">Hobbies</h3>
            <p className="mt-2 text-[15px] leading-6 text-ink">
              {participant.hobbies.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(", ")}
            </p>
          </section>

          <section className="sk thin soft v3 bg-paper p-4">
            <h3 className="leader flex items-center gap-1.5 [color:var(--warm-ink)]">
              <LineIcon name="heart" size={13} />
              A fact about them
            </h3>
            <p className="mt-2 text-[15px] leading-6 text-ink">
              {participant.fact}
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
