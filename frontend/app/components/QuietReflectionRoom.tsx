type QuietReflectionRoomProps = {
  privateNote: string;
  facilitatorNote: string;
  isSavingReflection: boolean;
  isReflectionShared: boolean;
  quietSpaceError: string;
  onPrivateNoteChange: (value: string) => void;
  onFacilitatorNoteChange: (value: string) => void;
  onExitQuietSpace: () => void;
  onShareReflection: () => void;
};

export function QuietReflectionRoom({
  privateNote,
  facilitatorNote,
  isSavingReflection,
  isReflectionShared,
  quietSpaceError,
  onPrivateNoteChange,
  onFacilitatorNoteChange,
  onExitQuietSpace,
  onShareReflection,
}: QuietReflectionRoomProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fffdf8] p-6 sm:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 sm:gap-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <button
            type="button"
            onClick={onExitQuietSpace}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-200"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={onShareReflection}
            disabled={
              isSavingReflection ||
              (!privateNote.trim() && !facilitatorNote.trim())
            }
            className="rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingReflection
              ? "Saving..."
              : isReflectionShared
                ? "Shared with facilitator"
                : "Share with facilitator"}
          </button>
        </div>

        <div className="py-2 text-center">
          <h2 className="inline-block border-b border-stone-200 pb-2 font-serif text-2xl font-semibold text-stone-950">
            Quiet Space to Reflect
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
            Take a calm moment for yourself. You can write your thoughts down
            freely.
          </p>
        </div>

        {isReflectionShared ? (
          <div className="my-auto rounded-2xl border border-stone-200 bg-[#faf7f1] p-6 py-8 text-center text-sm leading-relaxed text-stone-750 shadow-sm">
            Message is shared with facilitator.
          </div>
        ) : (
          <>
            {quietSpaceError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 shadow-sm">
                {quietSpaceError}
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="privateNote"
                  className="text-sm font-semibold text-stone-850"
                >
                  How are you feeling now?
                </label>
                <textarea
                  id="privateNote"
                  rows={4}
                  placeholder="Type here..."
                  value={privateNote}
                  onChange={(event) => onPrivateNoteChange(event.target.value)}
                  disabled={isSavingReflection}
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-stone-300 bg-white p-4 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="facilitatorNote"
                  className="text-sm font-semibold text-stone-850"
                >
                  What has made you come here now?
                </label>
                <textarea
                  id="facilitatorNote"
                  rows={4}
                  placeholder="Type here..."
                  value={facilitatorNote}
                  onChange={(event) =>
                    onFacilitatorNoteChange(event.target.value)
                  }
                  disabled={isSavingReflection}
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-stone-300 bg-white p-4 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
