import { useEffect, useState } from "react";

import { ReflectionShareSelection } from "../lib/types";
import { IconName, LineIcon } from "./DesignPrimitives";

type ReflectionTab = "guided" | "free";

type QuietReflectionRoomProps = {
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

const reflectionTabs: Array<{
  id: ReflectionTab;
  label: string;
  description: string;
  icon: IconName;
}> = [
  {
    id: "guided",
    label: "Guided questions",
    description: "Reflect with gentle prompts",
    icon: "heart",
  },
  {
    id: "free",
    label: "Free writing",
    description: "Write freely and privately",
    icon: "pen",
  },
];

export function QuietReflectionRoom({
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
    useState<ReflectionTab>("guided");
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
                {activeReflectionTab === "guided" ? (
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

function ReflectionTabList({
  activeTab,
  disabled,
  onTabChange,
}: {
  activeTab: ReflectionTab;
  disabled: boolean;
  onTabChange: (tab: ReflectionTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Reflection type"
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:border-r-2 lg:border-dashed lg:border-line lg:pr-3"
    >
      {reflectionTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "[border-color:var(--calm)] bg-calm-soft text-calm-ink"
                : "border-transparent bg-transparent text-muted hover:border-line hover:bg-card"
            }`}
          >
            <span
              aria-hidden="true"
              className={`av h-8 w-8 ${isActive ? "calm" : "muted"}`}
            >
              <LineIcon name={tab.icon} size={16} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">
                {tab.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GuidedReflectionFields({
  privateNote,
  facilitatorNote,
  disabled,
  onPrivateNoteChange,
  onFacilitatorNoteChange,
}: {
  privateNote: string;
  facilitatorNote: string;
  disabled: boolean;
  onPrivateNoteChange: (value: string) => void;
  onFacilitatorNoteChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <ReflectionTextarea
        id="privateNote"
        label="How are you feeling now?"
        rows={4}
        value={privateNote}
        disabled={disabled}
        onChange={onPrivateNoteChange}
      />

      <ReflectionTextarea
        id="facilitatorNote"
        label="What has made you come here today?"
        rows={4}
        value={facilitatorNote}
        disabled={disabled}
        onChange={onFacilitatorNoteChange}
      />
    </div>
  );
}

function FreeWritingField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <ReflectionTextarea
      id="freeWritingNote"
      label="Write freely"
      rows={10}
      placeholder="Start wherever you are..."
      value={value}
      disabled={disabled}
      onChange={onChange}
      className="min-h-[15rem]"
    />
  );
}

function ReflectionTextarea({
  id,
  label,
  rows,
  value,
  disabled,
  onChange,
  placeholder = "Type here...",
  className = "min-h-[96px]",
}: {
  id: string;
  label: string;
  rows: number;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`field calm ${className} resize-none leading-relaxed`}
      />
    </div>
  );
}

function ShareReflectionDialog({
  selection,
  canSend,
  disabled,
  onSelectionChange,
  onCancel,
  onSend,
}: {
  selection: ReflectionShareSelection;
  canSend: boolean;
  disabled: boolean;
  onSelectionChange: (selection: ReflectionShareSelection) => void;
  onCancel: () => void;
  onSend: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,52,45,0.22)] px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-reflection-title"
        className="sk w-full max-w-sm bg-card p-6 shadow-[0_24px_80px_rgba(58,52,45,0.24)] animate-fadeIn"
      >
        <div className="space-y-1.5">
          <h3
            id="share-reflection-title"
            className="h-title text-2xl text-ink"
          >
            Share with the facilitator
          </h3>
          <p className="text-[15px] leading-relaxed text-muted">
            Choose what you&apos;d like to share. Everything else stays private
            to you.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <ShareCheckbox
            label="Guided answers"
            checked={selection.guidedAnswers}
            disabled={disabled}
            onChange={(checked) =>
              onSelectionChange({ ...selection, guidedAnswers: checked })
            }
          />

          <ShareCheckbox
            label="Free writing"
            checked={selection.freeWriting}
            disabled={disabled}
            onChange={(checked) =>
              onSelectionChange({ ...selection, freeWriting: checked })
            }
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="btn ghost sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !canSend}
            className="btn calm sm"
          >
            {disabled ? "Sharing…" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareCheckbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="sk thin soft flex cursor-pointer items-center gap-3 bg-paper px-3.5 py-3 text-sm text-ink transition hover:[border-color:var(--calm)] has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-line accent-[var(--calm)] focus:ring-calm"
      />
      <span className="font-medium text-ink">{label}</span>
    </label>
  );
}
