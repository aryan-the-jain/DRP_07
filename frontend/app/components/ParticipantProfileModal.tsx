import { Participant } from "../lib/types";

type ParticipantProfileModalProps = {
  participant: Participant;
  onClose: () => void;
};

export function ParticipantProfileModal({
  participant,
  onClose,
}: ParticipantProfileModalProps) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-stone-950/10 px-4 py-24 sm:items-center sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-profile-title"
      onClick={onClose}
    >
      <article
        className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-5 text-stone-800 shadow-[0_24px_70px_rgba(68,52,35,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-[#eee6da] text-sm font-semibold text-stone-700">
              {participant.initials}
            </div>
            <div>
              <h2
                id="participant-profile-title"
                className="text-lg font-semibold text-stone-950"
              >
                {participant.displayName}
              </h2>
              <p className="text-sm capitalize text-stone-500">
                {participant.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-lg leading-none text-stone-500 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-200"
            aria-label="Close participant profile"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <section className="rounded-2xl bg-[#faf7f1] p-4">
            <h3 className="text-xs font-semibold uppercase text-stone-500">
              About me
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              {participant.aboutMe}
            </p>
          </section>

          <section className="rounded-2xl bg-[#faf7f1] p-4">
            <h3 className="text-xs font-semibold uppercase text-stone-500">
              Fun fact
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              {participant.funFact}
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
