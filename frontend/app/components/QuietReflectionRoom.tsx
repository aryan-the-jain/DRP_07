import { useEffect, useState } from "react";

import { ReflectionShareSelection } from "../lib/types";
import { LineIcon } from "./DesignPrimitives";
import { CalmingCorner } from "./quiet/CalmingCorner";
import {
  FreeWritingField,
  GuidedReflectionFields,
} from "./quiet/ReflectionFields";
import { ReflectionTab, ReflectionTabList } from "./quiet/ReflectionTabList";
import { ShareReflectionDialog } from "./quiet/ShareReflectionDialog";

type QuietReflectionRoomProps = {
  apiUrl: string;
  privateNote: string;
  facilitatorNote: string;
  freeWritingNote: string;
  shareSelection: ReflectionShareSelection;
  isSharingReflection: boolean;
  isReflectionShared: boolean;
  quietSpaceError: string;
  onPrivateNoteChange: (value: string) => void;
  onFacilitatorNoteChange: (value: string) => void;
  onFreeWritingNoteChange: (value: string) => void;
  onShareSelectionChange: (selection: ReflectionShareSelection) => void;
  onExitQuietSpace: () => void;
  onShareReflection: () => void | Promise<void>;
};

export function QuietReflectionRoom({
  apiUrl,
  privateNote,
  facilitatorNote,
  freeWritingNote,
  shareSelection,
  isSharingReflection,
  isReflectionShared,
  quietSpaceError,
  onPrivateNoteChange,
  onFacilitatorNoteChange,
  onFreeWritingNoteChange,
  onShareSelectionChange,
  onExitQuietSpace,
  onShareReflection,
}: QuietReflectionRoomProps) {
  const [activeReflectionTab, setActiveReflectionTab] =
    useState<ReflectionTab>("calming");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const hasGuidedText = Boolean(privateNote.trim() || facilitatorNote.trim());
  const hasFreeWritingText = Boolean(freeWritingNote.trim());
  const hasReflectionText = hasGuidedText || hasFreeWritingText;
  const hasSelectedReflectionText =
    (shareSelection.guidedAnswers && hasGuidedText) ||
    (shareSelection.freeWriting && hasFreeWritingText);
  const isReflectionBusy = isSharingReflection;

  useEffect(() => {
    if (!isShareDialogOpen || isReflectionBusy) {
      return;
    }

    function closeDialogOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsShareDialogOpen(false);
      }
    }

    window.addEventListener("keydown", closeDialogOnEscape);

    return () => window.removeEventListener("keydown", closeDialogOnEscape);
  }, [isShareDialogOpen, isReflectionBusy]);

  async function handleShareFromDialog() {
    if (!hasSelectedReflectionText) {
      return;
    }

    await onShareReflection();
    setIsShareDialogOpen(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--calm-soft)] p-4 sm:p-5">
      <div className="panel flex min-h-full [border-color:var(--calm)] bg-card px-5 py-5 shadow-[0_18px_50px_rgba(58,52,45,0.10)] sm:px-7 sm:py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-line pb-3">
            <button
              type="button"
              onClick={onExitQuietSpace}
              disabled={isReflectionBusy}
              className="btn sm inline-flex items-center gap-2"
            >
              <LineIcon name="arrowLeft" size={16} />
              Back to the group
            </button>

            {activeReflectionTab !== "calming" && (
              <div className="relative group w-fit">
                <button
                  type="button"
                  onClick={() => setIsShareDialogOpen(true)}
                  disabled={
                    isReflectionBusy || !hasReflectionText || isReflectionShared
                  }
                  className="btn calm sm inline-flex items-center gap-2"
                >
                  {isReflectionShared && !isSharingReflection && (
                    <LineIcon name="check" size={16} />
                  )}
                  {isSharingReflection
                    ? "Sharing…"
                    : isReflectionShared
                      ? "Shared"
                      : "Share with facilitator"}
                </button>
                <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(58,52,45,0.12)] w-52 text-xs leading-normal text-muted text-left block">
                  Choose which reflection notes to share privately with the
                  facilitator.
                </span>
              </div>
            )}
          </div>

          <div className="pt-1 text-center">
            <p className="leader [color:var(--calm)]">A space just for you</p>
            <h2 className="h-title uline mt-1 inline-block text-3xl text-[var(--calm-ink)]">
              Quiet space to reflect
            </h2>
            <p className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 text-[15px] leading-relaxed text-muted">
              <LineIcon name="quiet" size={16} />
              Take a calm moment for yourself. You can write your thoughts down
              freely.
            </p>
          </div>

          {isReflectionShared && (
            <div className="sk thin v2 [border-color:var(--calm)] bg-calm-soft p-4 text-center text-[15px] font-semibold text-calm-ink animate-fadeIn">
              Your reflection has been shared with the facilitator.
            </div>
          )}

          {quietSpaceError && (
            <div
              role="alert"
              className="sk thin soft bg-paper px-4 py-3 text-[15px] leading-relaxed text-warm-ink"
            >
              {quietSpaceError}
            </div>
          )}

          <div className="min-h-0 flex-1">
            <div className="grid gap-5 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
              <ReflectionTabList
                activeTab={activeReflectionTab}
                disabled={isReflectionBusy}
                onTabChange={setActiveReflectionTab}
              />

              <div className="mx-auto w-full max-w-3xl space-y-5">
                {activeReflectionTab === "calming" ? (
                  <CalmingCorner apiUrl={apiUrl} />
                ) : activeReflectionTab === "guided" ? (
                  <GuidedReflectionFields
                    privateNote={privateNote}
                    facilitatorNote={facilitatorNote}
                    disabled={isReflectionBusy}
                    onPrivateNoteChange={onPrivateNoteChange}
                    onFacilitatorNoteChange={onFacilitatorNoteChange}
                  />
                ) : (
                  <FreeWritingField
                    value={freeWritingNote}
                    disabled={isReflectionBusy}
                    onChange={onFreeWritingNoteChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isShareDialogOpen && (
        <ShareReflectionDialog
          selection={shareSelection}
          canSend={hasSelectedReflectionText}
          disabled={isReflectionBusy}
          onSelectionChange={onShareSelectionChange}
          onCancel={() => setIsShareDialogOpen(false)}
          onSend={handleShareFromDialog}
        />
      )}
    </div>
  );
}