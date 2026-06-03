import { useEffect, useState } from "react";

import { ReflectionShareSelection } from "../lib/types";

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
  icon: string;
}> = [
  {
    id: "guided",
    label: "Guided questions",
    description: "Reflect with gentle prompts",
    icon: "Q",
  },
  {
    id: "free",
    label: "Free writing",
    description: "Write freely and privately",
    icon: "W",
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fffdf8] p-4 sm:p-5">
      <div className="flex min-h-full rounded-3xl border border-stone-200 bg-[#fffdf8] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <button
              type="button"
              onClick={onExitQuietSpace}
              disabled={isReflectionBusy}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-150 hover:scale-[1.02] hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer focus:outline-none focus:ring-4 focus:ring-stone-200"
            >
              <span aria-hidden="true">&larr;</span>
              Go Back
            </button>

            <div className="relative group w-fit">
              <button
                type="button"
                onClick={() => setIsShareDialogOpen(true)}
                disabled={
                  isReflectionBusy || !hasReflectionText || isReflectionShared
                }
                className="rounded-2xl border border-stone-300 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-stone-800 hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm focus:outline-none focus:ring-4 focus:ring-stone-200"
              >
                {isSharingReflection
                  ? "Sharing..."
                  : isReflectionShared
                    ? "Shared"
                    : "Share with facilitator"}
              </button>
              <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 rounded-xl border border-stone-200 bg-[#faf7f1] shadow-md w-52 text-xs font-normal leading-normal text-stone-600 text-left block">
                Choose which reflection notes to share privately with Sean.
              </span>
            </div>
          </div>

          <div className="pt-1 text-center">
            <h2 className="inline-block border-b border-stone-200 pb-2 font-serif text-2xl font-semibold text-stone-950">
              Quiet Space to Reflect
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              Take a calm moment for yourself. You can write your thoughts down
              freely.
            </p>
          </div>

          {isReflectionShared && (
            <div className="rounded-2xl border border-stone-250 bg-[#faf7f1] p-4 text-center text-sm font-medium text-stone-700 shadow-sm animate-fadeIn">
              Message is shared with facilitator.
            </div>
          )}

          {quietSpaceError && (
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-650 shadow-sm">
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
      className="grid gap-2 border-stone-200 sm:grid-cols-2 lg:grid-cols-1 lg:border-r lg:pr-3"
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
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "border-[#d8ded5] bg-[#eef2ec] text-[#31564c] shadow-sm lg:border-l-4 lg:border-l-[#3f6f63] lg:pl-2.5"
                : "border-transparent bg-transparent text-stone-650 hover:border-stone-200 hover:bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-250 bg-white text-xs font-semibold text-[#31564c]"
            >
              {tab.icon}
            </span>
            <span>
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-stone-500">
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
      <label htmlFor={id} className="text-sm font-semibold text-stone-900">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`${className} w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-relaxed text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-reflection-title"
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-[#fffdf8] p-5 shadow-[0_24px_80px_rgba(68,52,35,0.18)]"
      >
        <div className="space-y-1.5">
          <h3
            id="share-reflection-title"
            className="text-base font-semibold text-stone-950"
          >
            Share with facilitator
          </h3>
          <p className="text-sm leading-relaxed text-stone-600">
            Choose what you&apos;d like to share with the facilitator.
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
            className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !canSend}
            className="rounded-2xl border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled ? "Sharing..." : "Share"}
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
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-700 shadow-sm has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#31564c] accent-[#31564c] focus:ring-stone-300"
      />
      <span className="font-medium text-stone-800">{label}</span>
    </label>
  );
}
