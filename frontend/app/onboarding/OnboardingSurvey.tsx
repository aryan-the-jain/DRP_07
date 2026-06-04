"use client";

import { useEffect, useState } from "react";

import { fallbackApiUrl, fetchOnboarding, saveOnboarding } from "../lib/api";
import {
  OnboardingPayload,
  OnboardingResponse,
  OnboardingStatus,
} from "../lib/types";
import { Icon, IconName } from "./Icon";
import { QuietSpaceCard, Screen } from "./MomentScreen";
import { ONBOARDING_SECTIONS, ShardBar } from "./ShardBar";
import {
  Choice,
  NoRushNotice as SaveBar,
  Opt,
  OptChips,
  OptList,
  Qn,
  SectionHead,
  TagField,
  TextField,
  UnderlineField,
} from "./SurveyParts";

// ---- answer option sets ----
// "Other" reveals a typed field; the skip option is gently set apart.
const OTHER = "Other";
const NOT_SAY = "I’d rather not say";

const PRONOUNS: Choice[] = [
  { text: "She / her" },
  { text: "He / him" },
  { text: "They / them" },
  { text: OTHER },
  { text: NOT_SAY, skip: true },
];

// section 2 · the lighter stuff
const HOBBIES: Choice[] = [
  { text: "Reading" },
  { text: "Music" },
  { text: "Cooking" },
  { text: "Gaming" },
  { text: "Sport & fitness" },
  { text: "Films & TV" },
  { text: "Art & crafts" },
  { text: "Photography" },
  { text: "The outdoors" },
  { text: "Gardening" },
  { text: "Writing" },
  { text: "Dancing" },
  { text: "Volunteering" },
  { text: "Animals & pets" },
  { text: OTHER },
  { text: NOT_SAY, skip: true },
];
const CULTURAL: Choice[] = [
  { text: "White / European" },
  { text: "Black / African / Caribbean" },
  { text: "South Asian" },
  { text: "East / Southeast Asian" },
  { text: "Middle Eastern / North African" },
  { text: "Latin American" },
  { text: "Mixed / multiple" },
  { text: OTHER },
  { text: NOT_SAY, skip: true },
];

// section 3 · in your own time (grief — kept from the design's wf-survey.jsx)
const RECENCY: Choice[] = [
  { text: "In the last few weeks" },
  { text: "A few months ago" },
  { text: "Longer ago" },
  { text: NOT_SAY, skip: true },
];
const WHO_LOST: Choice[] = [
  { text: "A family member" },
  { text: "A friend" },
  { text: "A pet" },
  { text: "Someone else" },
  { text: NOT_SAY, skip: true },
];

const LAST_SECTION = ONBOARDING_SECTIONS.length - 1;

type Answers = {
  callName: string;
  pronouns: string;
  pronounsOther: string;
  age: string;
  funFact: string;
  hobbies: string[];
  hobbiesOther: string[];
  cultural: string;
  culturalOther: string;
  recency: string;
  whoLost: string;
};

enum TextKey {
  CallName = "callName",
  PronounsOther = "pronounsOther",
  Age = "age",
  FunFact = "funFact",
  CulturalOther = "culturalOther",
}
enum SingleKey {
  Pronouns = "pronouns",
  Cultural = "cultural",
  Recency = "recency",
  WhoLost = "whoLost",
}

const EMPTY_ANSWERS: Answers = {
  callName: "",
  pronouns: "",
  pronounsOther: "",
  age: "",
  funFact: "",
  hobbies: [],
  hobbiesOther: [],
  cultural: "",
  culturalOther: "",
  recency: "",
  whoLost: "",
};

// ---- mapping between the survey's `Answers` and the backend payload ----
// "Other" reveals a typed value and "I'd rather not say" is a skip, so both are
// flattened away here: the backend only ever stores the final, plain value.

const knownTexts = (choices: Choice[]): string[] =>
  choices.filter((c) => !c.skip && c.text !== OTHER).map((c) => c.text);

// A single-choice answer (which may use "Other") → the value to store, or null.
function flattenChoice(value: string, other: string): string | null {
  if (!value || value === NOT_SAY) return null;
  if (value === OTHER) {
    const trimmed = other.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return value;
}

// A single-choice answer with only a skip option → the value to store, or null.
function flattenSkip(value: string): string | null {
  return !value || value === NOT_SAY ? null : value;
}

// A stored value → the matching chip, or "Other" + the typed value.
function expandChoice(
  stored: string | null,
  choices: Choice[],
): { value: string; other: string } {
  if (!stored) return { value: "", other: "" };
  if (knownTexts(choices).includes(stored)) return { value: stored, other: "" };
  return { value: OTHER, other: stored };
}

function answersToPayload(
  answers: Answers,
  status: OnboardingStatus,
): OnboardingPayload {
  const hobbies = [
    ...answers.hobbies.filter((h) => h !== OTHER && h !== NOT_SAY),
    ...answers.hobbiesOther.map((h) => h.trim()).filter((h) => h.length > 0),
  ];
  const age = parseInt(answers.age.trim(), 10);

  return {
    callName: answers.callName.trim(),
    pronouns: flattenChoice(answers.pronouns, answers.pronounsOther),
    age: Number.isNaN(age) ? null : age,
    funFact: answers.funFact.trim(),
    hobbies: hobbies.length > 0 ? JSON.stringify(hobbies) : null,
    culturalBackground: flattenChoice(answers.cultural, answers.culturalOther),
    griefRecency: flattenSkip(answers.recency),
    whoLost: flattenSkip(answers.whoLost),
    status,
  };
}

function responseToAnswers(resp: OnboardingResponse): Answers {
  const pronouns = expandChoice(resp.pronouns, PRONOUNS);
  const cultural = expandChoice(resp.culturalBackground, CULTURAL);

  // `hobbies` is a JSON-encoded string[]; parse it defensively.
  let storedHobbies: string[] = [];
  if (resp.hobbies) {
    try {
      const parsed = JSON.parse(resp.hobbies);
      if (Array.isArray(parsed)) {
        storedHobbies = parsed.filter(
          (h): h is string => typeof h === "string",
        );
      }
    } catch {
      storedHobbies = [];
    }
  }
  const known = knownTexts(HOBBIES);
  const hobbies = storedHobbies.filter((h) => known.includes(h));
  const hobbiesOther = storedHobbies.filter((h) => !known.includes(h));
  if (hobbiesOther.length > 0) hobbies.push(OTHER);

  return {
    callName: resp.callName ?? "",
    pronouns: pronouns.value,
    pronounsOther: pronouns.other,
    age: resp.age != null ? String(resp.age) : "",
    funFact: resp.funFact ?? "",
    hobbies,
    hobbiesOther,
    cultural: cultural.value,
    culturalOther: cultural.other,
    recency: resp.griefRecency ?? "",
    whoLost: resp.whoLost ?? "",
  };
}

export function OnboardingSurvey() {
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [finished, setFinished] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  // The "that's everything we need" pause point — shown once, the first time the
  // user leaves the (only required) first section.
  const [pausePromptSeen, setPausePromptSeen] = useState(false);
  const [pendingSection, setPendingSection] = useState<number | null>(null);
  const pausePromptOpen = pendingSection !== null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-fill from any saved answers so "pick up where I left off" survives a refresh.
  useEffect(() => {
    let active = true;
    fetchOnboarding(apiUrl)
      .then((saved) => {
        if (active && saved) setAnswers(responseToAnswers(saved));
      })
      .catch(() => {
        // Saved answers couldn't be reached — start the survey fresh.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiUrl]);

  // Persist the current answers (draft on "save later"/early exit, complete on
  // finish). Returns whether the save succeeded so callers can advance the UI.
  const persist = async (status: OnboardingStatus): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveOnboarding(apiUrl, answersToPayload(answers, status));
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "We couldn't save your answers just now.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setText = (key: TextKey, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const setHobbiesOther = (value: string[]) =>
    setAnswers((prev) => ({ ...prev, hobbiesOther: value }));

  const selectSingle = (key: SingleKey, value: string) =>
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));

  // Multi-select toggle. If a `skipText` ("I’d rather not say") is given it is
  // mutually exclusive with the real options: choosing it clears everything
  // else, and choosing anything real clears it.
  const toggleMulti = (key: "hobbies", value: string, skipText?: string) =>
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

  // Leaving the first section the first time → hold navigation and show the
  // pause prompt; `target` is where the user was heading.
  const leaveFirstSection = (target: number) => {
    if (section === 0 && target !== 0 && !pausePromptSeen) {
      setPausePromptSeen(true);
      setPendingSection(target);
      return true;
    }
    return false;
  };

  const goBack = () => setSection((s) => Math.max(0, s - 1));
  const goNext = async () => {
    if (section < LAST_SECTION) {
      if (leaveFirstSection(section + 1)) return;
      setSection((s) => s + 1);
      return;
    }
    // Finish — persist the whole survey as a completed submission.
    if (await persist(OnboardingStatus.Complete)) setFinished(true);
  };

  const onSaveAndFinishLater = async () => {
    // Persist whatever has been entered so far as a draft, then reassure.
    if (await persist(OnboardingStatus.Draft)) setSavedForLater(true);
  };

  // Pause prompt actions.
  const onPauseEnter = async () => {
    // Leaving early after the (only required) first section — keep it as a draft.
    setPendingSection(null);
    if (await persist(OnboardingStatus.Draft)) setFinished(true);
  };
  const onPauseContinue = () => {
    if (pendingSection !== null) setSection(pendingSection);
    setPendingSection(null);
  };

  const isLast = section === LAST_SECTION;

  // A section counts as "genuinely done" once it holds at least one answer.
  const completed = [
    Boolean(
      answers.callName.trim() ||
        answers.pronouns ||
        answers.age.trim(),
    ),
    Boolean(answers.funFact.trim() || answers.hobbies.length > 0 || answers.cultural),
    Boolean(answers.recency || answers.whoLost),
  ];

  const goToSection = (index: number) => {
    setFinished(false);
    if (leaveFirstSection(index)) return;
    setSection(index);
  };

  // Hold a calm blank page while saved answers load, to avoid a flash of the
  // empty form before it pre-fills.
  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--paper)" }} />
    );
  }

  // Finished the survey → the "tender moments" first screen (StateFinding).
  if (finished) {
    return <SubmitScreen />;
  }

  // Saved & finishing later → a calm, reassuring screen back into the survey.
  if (savedForLater) {
    return <SavedScreen onResume={() => setSavedForLater(false)} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--paper)",
      }}
    >
      {/* sticky top: title + shard progress bar + optional notice */}
      <div style={{ flex: "0 0 auto" }}>
        {/* title bar — grey line sits here, above the shard bar */}
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
            className="save-pill"
            onClick={onSaveAndFinishLater}
            disabled={saving}
          >
            <Icon name={IconName.Bookmark} size={16} c="var(--calm)" /> Save &amp;
            come back later
          </button>
        </div>

        <div style={{ padding: "22px 40px 6px" }}>
          <ShardBar
            current={section}
            completed={completed}
            onSelect={goToSection}
          />
        </div>

        {!noticeDismissed && (
          <div style={{ padding: "8px 40px 14px" }}>
            <SaveBar onDismiss={() => setNoticeDismissed(true)} />
          </div>
        )}
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
          {section === 0 && (
            <SectionAbout
              answers={answers}
              setText={setText}
              selectSingle={selectSingle}
            />
          )}
          {section === 1 && (
            <SectionMore
              answers={answers}
              setText={setText}
              setHobbiesOther={setHobbiesOther}
              selectSingle={selectSingle}
              toggleMulti={toggleMulti}
            />
          )}
          {section === 2 && (
            <SectionInYourTime answers={answers} selectSingle={selectSingle} />
          )}
        </div>
      </div>

      {saveError && (
        <div style={{ flex: "0 0 auto", padding: "0 40px 6px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.4,
              textAlign: "center",
              color: "#9c5b54",
            }}
          >
            {saveError}
          </p>
        </div>
      )}

      {/* sticky bottom: back / next */}
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
              name={IconName.Chev}
              size={16}
              c="var(--muted)"
              style={{ transform: "scaleX(-1)" }}
            />{" "}
            Back
          </button>
        ) : (
          <span style={{ width: 90 }} />
        )}
        <button
          type="button"
          className="btn warm"
          onClick={goNext}
          disabled={saving}
        >
          {isLast ? (
            <>
              Finish setting up <Icon name={IconName.Check} size={16} c="#fff" />
            </>
          ) : (
            <>
              Next <Icon name={IconName.Chev} size={16} c="#fff" />
            </>
          )}
        </button>
      </div>

      {pausePromptOpen && (
        <PausePopup onEnter={onPauseEnter} onContinue={onPauseContinue} />
      )}
    </div>
  );
}

// The "that's everything we need" pause point, shown as a gentle overlay after
// the first (only required) section. Ported from the design's PausePoint.
function PausePopup({
  onEnter,
  onContinue,
}: {
  onEnter: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(58, 52, 45, 0.34)",
        padding: 24,
      }}
    >
      <div className="pause-card" style={{ maxWidth: 560 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Icon name={IconName.Mug} size={28} c="var(--calm)" />
          <span className="h-title" style={{ fontSize: 27, color: "#3c5a4c" }}>
            That’s everything we need.
          </span>
        </div>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--ink)",
            margin: "0 0 8px",
          }}
        >
          You can stop right here — your space is ready, and you can step into it
          now.
        </p>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: "var(--muted)",
            margin: "0 0 22px",
          }}
        >
          There’s a little more that helps us find the right group for you, but
          it’s entirely optional and there’s no rush at all. Come back to it
          whenever you feel ready.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn warm"
            style={{ fontSize: 16 }}
            onClick={onContinue}
          >
            Keep going, gently <Icon name={IconName.Chev} size={15} c="var(--paper)" />
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 15.5, borderColor: "var(--calm)", color: "#3c5a4c" }}
            onClick={onEnter}
          >
            Take me in — I’ll finish later
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================ SECTIONS

// Section 1 · personal data — call name, pronouns, age.
function SectionAbout({
  answers,
  setText,
  selectSingle,
}: {
  answers: Answers;
  setText: (key: TextKey, value: string) => void;
  selectSingle: (key: SingleKey, value: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="A little about you"
        sub="Just a few basics — so we know who we’re talking to."
      />
      {/* text · boxed field */}
      <Qn
        q="What would you like us to call you?"
        needed
        why="it’s the name your circle and facilitator will see."
        use="Your real name is never shown."
      >
        <TextField
          id="callName"
          label="What would you like us to call you?"
          placeholder="Type a name…"
          value={answers.callName}
          onChange={(v) => setText(TextKey.CallName, v)}
        />
      </Qn>

      {/* single + 'other' typed */}
      <Qn
        q="Which pronouns feel right?"
        optional
        why="so your facilitator and group address you the way you’d like."
      >
        <OptChips
          items={PRONOUNS}
          isSelected={(text) => answers.pronouns === text}
          onToggle={(text) => selectSingle(SingleKey.Pronouns, text)}
        />
        {answers.pronouns === OTHER && (
          <div style={{ marginTop: 12 }}>
            <UnderlineField
              id="pronounsOther"
              label="Your pronouns"
              placeholder="Your pronouns…"
              value={answers.pronounsOther}
              onChange={(v) => setText(TextKey.PronounsOther, v)}
            />
          </div>
        )}
      </Qn>

      {/* text · boxed field */}
      <Qn
        q="How old are you?"
        needed
        why="to gently place you with people at a similar stage of life."
        use="Only used to match your group; never shown."
      >
        <TextField
          id="age"
          label="How old are you?"
          placeholder="e.g. 21"
          value={answers.age}
          onChange={(v) => setText(TextKey.Age, v)}
        />
      </Qn>
    </div>
  );
}

// Section 2 · the lighter stuff — fun fact, hobbies, cultural background.
function SectionMore({
  answers,
  setText,
  setHobbiesOther,
  selectSingle,
  toggleMulti,
}: {
  answers: Answers;
  setText: (key: TextKey, value: string) => void;
  setHobbiesOther: (value: string[]) => void;
  selectSingle: (key: SingleKey, value: string) => void;
  toggleMulti: (key: "hobbies", value: string, skipText?: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="A bit more about you"
        sub="The lighter stuff — only what you’d like to share."
      />
      {/* text · underline only */}
      <Qn
        q="Got a fun fact about yourself?"
        optional
        why="a gentle way for people to find common ground."
        use="Shared with your group to help you connect."
      >
        <UnderlineField
          id="funFact"
          label="A fun fact about you"
          placeholder="Anything at all…"
          value={answers.funFact}
          onChange={(v) => setText(TextKey.FunFact, v)}
        />
      </Qn>

      {/* multiple + 'other' typed (skip is mutually exclusive) */}
      <Qn
        q="What do you enjoy?"
        optional
        why="small shared interests can make a first meeting feel easier."
      >
        <OptChips
          items={HOBBIES}
          isSelected={(text) => answers.hobbies.includes(text)}
          onToggle={(text) => toggleMulti("hobbies", text, NOT_SAY)}
        />
        {answers.hobbies.includes(OTHER) && (
          <div style={{ marginTop: 12 }}>
            <TagField
              id="hobbiesOther"
              label="Other things you enjoy"
              placeholder="Type one and press Enter…"
              values={answers.hobbiesOther}
              onChange={setHobbiesOther}
            />
          </div>
        )}
      </Qn>

      {/* single + 'other' typed */}
      <Qn
        q="What’s your cultural background?"
        optional
        why="only if you’d like to — it can help your group feel familiar and understood."
      >
        <OptChips
          items={CULTURAL}
          isSelected={(text) => answers.cultural === text}
          onToggle={(text) => selectSingle(SingleKey.Cultural, text)}
        />
        {answers.cultural === OTHER && (
          <div style={{ marginTop: 12 }}>
            <UnderlineField
              id="culturalOther"
              label="Your cultural background"
              placeholder="In your own words…"
              value={answers.culturalOther}
              onChange={(v) => setText(TextKey.CulturalOther, v)}
            />
          </div>
        )}
      </Qn>
    </div>
  );
}

// Section 3 · in your own time — the two grief questions (kept).
function SectionInYourTime({
  answers,
  selectSingle,
}: {
  answers: Answers;
  selectSingle: (key: SingleKey, value: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="In your own time"
        sub="Skip anything you’d rather not share."
      />
      {/* single · stacked with marker */}
      <Qn
        q="How recently did it happen?"
        optional
        why="only to place you with people at a similar point in their grief."
        use="Used once, to match your group; never displayed."
      >
        <OptList>
          {RECENCY.map((o, i) => (
            <Opt
              key={o.text}
              text={o.text}
              skip={o.skip}
              vary={i}
              selected={answers.recency === o.text}
              onClick={() => selectSingle(SingleKey.Recency, o.text)}
            />
          ))}
        </OptList>
      </Qn>
      {/* single · inline chips */}
      <Qn
        q="Who did you lose?"
        optional
        why="so the people you meet have walked something similar."
        use="Only ever shared with your group if you choose to."
      >
        <OptChips
          items={WHO_LOST}
          isSelected={(text) => answers.whoLost === text}
          onToggle={(text) =>
            selectSingle(SingleKey.WhoLost, answers.whoLost === text ? "" : text)
          }
        />
      </Qn>
    </div>
  );
}

// ============================================================ MOMENT SCREENS

// Submit → the "Tender moments" first screen (StateFinding from the design):
// finishing onboarding lands on a warm "still finding your group" state, with
// the quiet space open in the meantime.
function SubmitScreen() {
  return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
        >
          <Icon name={IconName.People} size={46} c="var(--warm)" />
        </div>
        <div className="h-title" style={{ fontSize: 24, lineHeight: 1.15 }}>
          We’re still finding the
          <br />
          right people for you.
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.45,
            color: "var(--muted)",
            margin: "12px 12px 0",
          }}
        >
          A good group takes a few of the right people. We’ll let you know the
          moment yours is ready — there’s no rush, and no waiting room.
        </p>
      </div>
      <QuietSpaceCard />
    </Screen>
  );
}

// Save & finish later → a reassuring "your place is held" screen with the same
// quiet space, plus a clear way straight back into the survey.
function SavedScreen({ onResume }: { onResume: () => void }) {
  return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
        >
          <Icon name={IconName.Quiet} size={46} c="var(--calm)" />
        </div>
        <span className="leader" style={{ color: "var(--calm)" }}>
          saved for now
        </span>
        <div
          className="h-title"
          style={{ fontSize: 24, lineHeight: 1.15, marginTop: 6 }}
        >
          Your place is held.
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.45,
            color: "var(--muted)",
            margin: "12px 12px 0",
          }}
        >
          We’ve kept everything you’ve shared so far. There’s no rush to finish —
          come back whenever you’re ready and pick up right where you left off.
        </p>
      </div>
      <button
        type="button"
        className="btn warm"
        style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
        onClick={onResume}
      >
        Pick up where I left off <Icon name={IconName.Chev} size={16} c="#fff" />
      </button>
      <QuietSpaceCard />
    </Screen>
  );
}
