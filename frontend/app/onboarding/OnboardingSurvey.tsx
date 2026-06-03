"use client";

import { useState } from "react";

import { Icon } from "./Icon";
import { ONBOARDING_SECTIONS, ShardBar } from "./ShardBar";
import {
  Choice,
  Opt,
  OptChips,
  OptList,
  Qn,
  SectionHead,
  TextField,
  UnderlineField,
} from "./SurveyParts";

// ---- answer option sets (copy from the design's wf-survey.jsx) ----
const RECENCY: Choice[] = [
  { text: "In the last few weeks" },
  { text: "A few months ago" },
  { text: "Longer ago" },
  { text: "I’d rather not say", skip: true },
];
const WHO_LOST: Choice[] = [
  { text: "A family member" },
  { text: "A friend" },
  { text: "A pet" },
  { text: "Someone else" },
  { text: "I’d rather not say", skip: true },
];
const HARDEST: Choice[] = [
  { text: "Sleep" },
  { text: "Concentrating" },
  { text: "Being around people" },
  { text: "The quiet moments" },
  { text: "I’d rather not say", skip: true },
];
const ENJOY: Choice[] = [
  { text: "Music" },
  { text: "Being outside" },
  { text: "Reading" },
  { text: "Cooking" },
];

const LAST_SECTION = ONBOARDING_SECTIONS.length - 1;

type Answers = {
  callName: string;
  groundingWord: string;
  recency: string;
  whoLost: string;
  hardest: string[];
  enjoy: string[];
};

const EMPTY_ANSWERS: Answers = {
  callName: "",
  groundingWord: "",
  recency: "",
  whoLost: "",
  hardest: [],
  enjoy: [],
};

export function OnboardingSurvey() {
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [finished, setFinished] = useState(false);

  const setText = (key: "callName" | "groundingWord", value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const selectSingle = (key: "recency" | "whoLost", value: string) =>
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));

  // Multi-select toggle. If a `skipText` ("I’d rather not say") is given it is
  // mutually exclusive with the real options: choosing it clears everything
  // else, and choosing anything real clears it.
  const toggleMulti = (
    key: "hardest" | "enjoy",
    value: string,
    skipText?: string,
  ) =>
    setAnswers((prev) => {
      const current = prev[key];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }
      if (skipText && value === skipText) {
        return { ...prev, [key]: [value] };
      }
      const withoutSkip = skipText
        ? current.filter((v) => v !== skipText)
        : current;
      return { ...prev, [key]: [...withoutSkip, value] };
    });

  const goBack = () => setSection((s) => Math.max(0, s - 1));
  const goNext = () => {
    if (section < LAST_SECTION) {
      setSection((s) => s + 1);
      return;
    }
    // Finish — frontend-only stub (no network call yet).
    setFinished(true);
  };

  const onSaveAndFinishLater = () => {
    // Stub: persistence arrives with the backend iteration.
    setFinished(true);
  };

  const isLast = section === LAST_SECTION;

  // A section counts as "genuinely done" once it holds at least one answer.
  const completed = [
    Boolean(answers.callName.trim() || answers.groundingWord.trim()),
    Boolean(answers.recency || answers.whoLost),
    answers.hardest.length > 0 || answers.enjoy.length > 0,
  ];

  const goToSection = (index: number) => {
    setFinished(false);
    setSection(index);
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--paper)",
      }}
    >
      {/* sticky top: title + shard progress bar */}
      <div style={{ flex: "0 0 auto"/*, borderBottom: "2px solid var(--line)" */}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 30px",
            borderBottom: "2px solid var(--line)",
          }}
        >
          <span className="h-title" style={{ fontSize: 22, color: "var(--ink)" }}>
            Setting up your space
          </span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onSaveAndFinishLater}
            style={{
              fontFamily: "var(--hand)",
              fontSize: 14.5,
              color: "var(--calm)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textUnderlineOffset: 3,
            }}
          >
            save &amp; finish later
          </button>
        </div>

        <div style={{ padding: "22px 40px 6px" }}>
          <ShardBar
            current={finished ? ONBOARDING_SECTIONS.length : section}
            completed={completed}
            onSelect={goToSection}
          />
        </div>
      </div>

      {/* scrollable body */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "14px 40px 24px",
        }}
      >
        <div style={{ maxWidth: 600, margin: "8px auto 0" }}>
          {finished ? (
            <FinishedPanel />
          ) : (
            <>
              {section === 0 && <SectionAbout answers={answers} setText={setText} />}
              {section === 1 && (
                <SectionInYourTime answers={answers} selectSingle={selectSingle} />
              )}
              {section === 2 && (
                <SectionWhatHelps answers={answers} toggleMulti={toggleMulti} />
              )}
            </>
          )}
        </div>
      </div>

      {/* sticky bottom: back / next */}
      {!finished && (
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 40px",
            borderTop: "2px solid var(--line)",
          }}
        >
          {section > 0 ? (
            <button type="button" className="btn ghost" onClick={goBack}>
              <Icon
                name="chev"
                size={16}
                c="var(--muted)"
                style={{ transform: "scaleX(-1)" }}
              />{" "}
              Back
            </button>
          ) : (
            <span style={{ width: 90 }} />
          )}
          <button type="button" className="btn warm" onClick={goNext}>
            {isLast ? (
              <>
                Finish setting up <Icon name="check" size={16} c="#fff" />
              </>
            ) : (
              <>
                Next <Icon name="chev" size={16} c="#fff" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================ SECTIONS

function SectionAbout({
  answers,
  setText,
}: {
  answers: Answers;
  setText: (key: "callName" | "groundingWord", value: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="A little about you"
        sub="Just so we know who we’re talking to."
      />
      {/* text · boxed field */}
      <Qn
        q="What would you like us to call you?"
        why="it’s the name your group will see"
      >
        <TextField
          id="callName"
          label="What would you like us to call you?"
          placeholder="Type a name…"
          value={answers.callName}
          onChange={(v) => setText("callName", v)}
        />
      </Qn>
      {/* text · underline only */}
      <Qn
        q="Is there a word that’s been grounding you?"
        why="only if something comes to mind"
      >
        <UnderlineField
          id="groundingWord"
          label="Is there a word that’s been grounding you?"
          placeholder="A word or a short phrase…"
          value={answers.groundingWord}
          onChange={(v) => setText("groundingWord", v)}
        />
      </Qn>
    </div>
  );
}

function SectionInYourTime({
  answers,
  selectSingle,
}: {
  answers: Answers;
  selectSingle: (key: "recency" | "whoLost", value: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="In your own time"
        optional
        sub="Skip anything you’d rather not share."
      />
      {/* single · stacked with marker */}
      <Qn
        q="How recently did it happen?"
        optional
        why="only to place you with people at a similar point, skip if you’d rather"
      >
        <OptList>
          {RECENCY.map((o, i) => (
            <Opt
              key={o.text}
              text={o.text}
              skip={o.skip}
              vary={i}
              selected={answers.recency === o.text}
              onClick={() => selectSingle("recency", o.text)}
            />
          ))}
        </OptList>
      </Qn>
      {/* single · inline chips */}
      <Qn q="Who did you lose?" optional>
        <OptChips
          items={WHO_LOST}
          isSelected={(text) => answers.whoLost === text}
          onToggle={(text) =>
            selectSingle("whoLost", answers.whoLost === text ? "" : text)
          }
        />
      </Qn>
    </div>
  );
}

function SectionWhatHelps({
  answers,
  toggleMulti,
}: {
  answers: Answers;
  toggleMulti: (
    key: "hardest" | "enjoy",
    value: string,
    skipText?: string,
  ) => void;
}) {
  const hardestSkip = HARDEST.find((o) => o.skip)?.text;
  return (
    <div>
      <SectionHead
        title="What might help"
        sub="There are no right answers here."
      />
      {/* multiple · stacked checkbox (skip is mutually exclusive) */}
      <Qn
        q="What feels hardest right now?"
        optional
        why="choose any that fit, or none"
      >
        <OptList>
          {HARDEST.map((o, i) => (
            <Opt
              key={o.text}
              text={o.text}
              multi
              skip={o.skip}
              vary={i}
              selected={answers.hardest.includes(o.text)}
              onClick={() => toggleMulti("hardest", o.text, hardestSkip)}
            />
          ))}
        </OptList>
      </Qn>
      {/* multiple · inline chips */}
      <Qn
        q="What do you enjoy, when you have the energy?"
        why="small things to spark a connection in your group"
      >
        <OptChips
          items={ENJOY}
          isSelected={(text) => answers.enjoy.includes(text)}
          onToggle={(text) => toggleMulti("enjoy", text)}
        />
      </Qn>
    </div>
  );
}

function FinishedPanel() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div className="h-title" style={{ fontSize: 30, marginBottom: 12 }}>
        Your space is ready
      </div>
      <p
        style={{
          fontSize: 16,
          color: "var(--muted)",
          maxWidth: 420,
          margin: "0 auto",
          lineHeight: 1.5,
        }}
      >
        Thank you for taking the time. While you're waiting for the facilitator to match you with a group, feel free to check out the Quiet Space.
      </p>
    </div>
  );
}
