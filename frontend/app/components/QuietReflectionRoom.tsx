import { useCallback, useEffect, useState } from "react";

import { fetchSupportLinks } from "../lib/api";
import { ReflectionShareSelection, SupportLink } from "../lib/types";
import { IconName, LineIcon } from "./DesignPrimitives";

type ReflectionTab = "calming" | "guided" | "free";

type CalmingView = "breathe" | "steady" | "resources";

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

const reflectionTabs: Array<{
  id: ReflectionTab;
  label: string;
  description: string;
  icon: IconName;
}> = [
  {
    id: "calming",
    label: "Calming corner",
    description: "Breathe & settle",
    icon: "wind",
  },
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

const calmingViews: Array<{ id: CalmingView; label: string }> = [
  { id: "breathe", label: "Breathe" },
  { id: "steady", label: "Steady me" },
  { id: "resources", label: "Resources" },
];

function CalmingCorner({ apiUrl }: { apiUrl: string }) {
  const [activeView, setActiveView] = useState<CalmingView>("breathe");

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Calming corner"
        className="flex flex-wrap gap-2"
      >
        {calmingViews.map((view) => {
          const isActive = view.id === activeView;

          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveView(view.id)}
              className={`btn sm ${isActive ? "calm" : "ghost"}`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {activeView === "breathe" ? (
        <BreathePanel />
      ) : activeView === "steady" ? (
        <SteadyMePanel />
      ) : (
        <ResourcesPanel apiUrl={apiUrl} />
      )}
    </div>
  );
}

const breathePhases: Array<{ label: string; ms: number }> = [
  { label: "Breathe in", ms: 4000 },
  { label: "Hold", ms: 2000 },
  { label: "Breathe out", ms: 6000 },
  { label: "Rest", ms: 1000 },
];

function BreathePanel() {
  const [phaseLabel, setPhaseLabel] = useState(breathePhases[0].label);

  // Walk the labels in step with the CSS keyframe; clean up on unmount.
  useEffect(() => {
    let index = 0;
    let timer = 0;

    const advance = () => {
      timer = window.setTimeout(() => {
        index = (index + 1) % breathePhases.length;
        setPhaseLabel(breathePhases[index].label);
        advance();
      }, breathePhases[index].ms);
    };

    advance();

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="sk soft bg-card p-6 text-center sm:p-8">
      <p className="text-[15px] leading-relaxed text-muted">
        Follow the circle if it helps. There&apos;s no rush — let your breath
        find its own pace.
      </p>

      <div className="mt-7 flex items-center justify-center">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <span
            aria-hidden="true"
            className="breathe-orb absolute inset-0 rounded-full border-2 bg-calm-soft [border-color:var(--calm)]"
          />
          <span
            aria-live="polite"
            className="scrawl relative text-3xl text-calm-ink"
          >
            {phaseLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

const groundingSteps: Array<{ count: string; prompt: string; hint: string }> = [
  {
    count: "5",
    prompt: "things you can see",
    hint: "Look slowly around you and name five of them.",
  },
  {
    count: "4",
    prompt: "things you can touch",
    hint: "Notice what your hands or feet can feel right now.",
  },
  {
    count: "3",
    prompt: "things you can hear",
    hint: "Let the sounds nearby come to you.",
  },
  {
    count: "2",
    prompt: "things you can smell",
    hint: "Take a gentle breath in.",
  },
  {
    count: "1",
    prompt: "good thing about right now",
    hint: "However small, it counts.",
  },
];

function SteadyMePanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const isFinal = stepIndex >= groundingSteps.length;

  return (
    <div className="sk soft bg-card p-6 sm:p-8">
      <div
        className="flex items-center justify-center gap-2"
        aria-hidden="true"
      >
        {groundingSteps.map((_, index) => {
          const tone =
            index < stepIndex
              ? "bg-[var(--calm)]"
              : index === stepIndex && !isFinal
                ? "bg-[var(--warm)]"
                : "bg-[var(--line)]";

          return (
            <span key={index} className={`h-2.5 w-2.5 rounded-full ${tone}`} />
          );
        })}
      </div>

      {isFinal ? (
        <div className="mt-7 text-center">
          <h3 className="h-title text-2xl text-calm-ink">
            You&apos;re here. Well done for taking this moment.
          </h3>
          <button
            type="button"
            onClick={() => setStepIndex(0)}
            className="btn sm mt-5"
          >
            Start again
          </button>
        </div>
      ) : (
        <div className="mt-7 text-center">
          <p className="scrawl text-5xl text-calm-ink">
            {groundingSteps[stepIndex].count}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            {groundingSteps[stepIndex].prompt}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {groundingSteps[stepIndex].hint}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={stepIndex === 0}
              className="btn ghost sm inline-flex items-center gap-2"
            >
              <LineIcon name="arrowLeft" size={15} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((index) => index + 1)}
              className="btn calm sm"
            >
              {stepIndex === groundingSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function isHttpUrl(url: string) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function ResourcesPanel({ apiUrl }: { apiUrl: string }) {
  const [links, setLinks] = useState<SupportLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await fetchSupportLinks(apiUrl);
      // Re-check client-side that we only ever render http(s) links.
      setLinks(result.filter((link) => isHttpUrl(link.url)));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLinks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLinks]);

  if (isLoading) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center text-[15px] text-muted">
        Gathering what your facilitator has shared…
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center">
        <p className="text-[15px] leading-relaxed text-muted">
          We couldn&apos;t load these just now.
        </p>
        <button
          type="button"
          onClick={() => void loadLinks()}
          className="btn sm mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="sk thin soft dash bg-paper p-6 text-center text-[15px] leading-relaxed text-muted">
        Your facilitator hasn&apos;t shared anything here yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sk thin soft block bg-card p-4 transition hover:[border-color:var(--calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink">
              {link.title}
            </span>
            <LineIcon
              name="externalLink"
              size={16}
              className="mt-0.5 shrink-0 text-muted"
            />
          </span>
          {link.description && (
            <span className="mt-1 block text-sm leading-relaxed text-muted">
              {link.description}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
