"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Sidebar } from "../components/Sidebar";
import { fallbackApiUrl, fetchOnboarding, saveOnboarding } from "../lib/api";
import { OnboardingStatus, OnboardingPayload } from "../lib/types";

type Choice = {
  text: string;
  skip?: boolean;
};

const OTHER = "In my own words";
const NOT_SAY = "I’d rather not say";

const PRONOUNS: Choice[] = [
  { text: "She / her" },
  { text: "He / him" },
  { text: "They / them" },
  { text: OTHER },
  { text: NOT_SAY, skip: true },
];

const AGE_RANGES: Choice[] = [
  { text: "Under 18" },
  { text: "18–21" },
  { text: "22–25" },
  { text: "26–30" },
  { text: "31+" },
  { text: NOT_SAY, skip: true },
];

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

const RECENCY: Choice[] = [
  { text: "Within the last few weeks" },
  { text: "Within the last few months" },
  { text: "Around 6 months ago" },
  { text: "Longer ago" },
  { text: NOT_SAY, skip: true },
];

const WHO_LOST: Choice[] = [
  { text: "A family member" },
  { text: "A partner" },
  { text: "A friend" },
  { text: "A pet" },
  { text: OTHER },
  { text: NOT_SAY, skip: true },
];

const VARY = ["", "v2", "v3"] as const;

const knownTexts = (choices: Choice[]): string[] =>
  choices.filter((c) => !c.skip && c.text !== OTHER).map((c) => c.text);

function expandChoice(
  stored: string | null,
  choices: Choice[],
  otherText = OTHER,
): { value: string; other: string } {
  if (!stored) return { value: "", other: "" };
  if (stored === NOT_SAY) return { value: NOT_SAY, other: "" };
  if (knownTexts(choices).includes(stored)) return { value: stored, other: "" };
  return { value: otherText, other: stored };
}

function flattenChoice(value: string, other: string, otherTrigger = OTHER): string | null {
  if (!value) return null;
  if (value === NOT_SAY) return NOT_SAY;
  if (value === otherTrigger) {
    const trimmed = other.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return value;
}

export default function ProfilePage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [callName, setCallName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [pronounsOther, setPronounsOther] = useState("");
  const [age, setAge] = useState("");
  const [fact, setFact] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [hobbiesOther, setHobbiesOther] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");
  const [cultural, setCultural] = useState("");
  const [culturalOther, setCulturalOther] = useState("");
  const [recency, setRecency] = useState("");
  const [whoLost, setWhoLost] = useState("");
  const [whoLostOther, setWhoLostOther] = useState("");

  useEffect(() => {
    let active = true;

    fetchOnboarding(apiUrl)
      .then((data) => {
        if (!active) return;
        if (data) {
          setCallName(data.callName || "");

          const p = expandChoice(data.pronouns, PRONOUNS);
          setPronouns(p.value);
          setPronounsOther(p.other);

          setAge(data.age || "");
          setFact(data.fact || "");

          const knownH = knownTexts(HOBBIES);
          const rawHobbies = data.hobbies || [];
          const notSayHobbies = rawHobbies.includes(NOT_SAY);
          const hList = rawHobbies.filter((h) => knownH.includes(h));
          const hOther = rawHobbies.filter((h) => !knownH.includes(h) && h !== NOT_SAY);
          if (hOther.length > 0) hList.push(OTHER);
          if (notSayHobbies) hList.push(NOT_SAY);
          setSelectedHobbies(hList);
          setHobbiesOther(hOther);

          const c = expandChoice(data.culturalBackground, CULTURAL);
          setCultural(c.value);
          setCulturalOther(c.other);

          setRecency(data.griefRecency || "");

          const w = expandChoice(data.whoLost, WHO_LOST);
          setWhoLost(w.value);
          setWhoLostOther(w.other);
        }
      })
      .catch(() => {
        setErrorMessage("We couldn't load your profile details. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiUrl]);

  const selectSingle = (
    current: string,
    setCurrent: (v: string) => void,
    value: string
  ) => {
    setCurrent(current === value ? "" : value);
  };

  const toggleMultiHobbies = (value: string) => {
    if (selectedHobbies.includes(value)) {
      setSelectedHobbies(selectedHobbies.filter((v) => v !== value));
      return;
    }
    if (value === NOT_SAY) {
      setSelectedHobbies([NOT_SAY]);
      return;
    }
    const withoutSkip = selectedHobbies.filter((v) => v !== NOT_SAY);
    setSelectedHobbies([...withoutSkip, value]);
  };

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!callName.trim()) {
      setErrorMessage("Please enter a preferred name.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const finalHobbies = [
      ...selectedHobbies.filter((h) => h !== OTHER),
      ...hobbiesOther.map((h) => h.trim()).filter((h) => h.length > 0),
    ];

    const payload: OnboardingPayload = {
      callName: callName.trim(),
      pronouns: flattenChoice(pronouns, pronounsOther),
      age: age || null,
      fact: fact.trim(),
      hobbies: finalHobbies,
      culturalBackground: flattenChoice(cultural, culturalOther),
      griefRecency: recency || null,
      whoLost: flattenChoice(whoLost, whoLostOther),
      status: OnboardingStatus.Complete,
    };

    try {
      await saveOnboarding(apiUrl, payload);
      setSuccessMessage("Your changes have been saved gently.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setErrorMessage("We couldn't save your changes. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-paper text-ink">
      <Sidebar activeTab="profile" />

      {/* Main Content scrollable area */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
          <div>
            <h1 className="scrawl text-4xl text-ink font-semibold">Your Profile</h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              These details are shared gently with your peer circle and facilitator to help you connect.
            </p>
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-[15px] text-muted">
              Loading your details…
            </p>
          ) : (
            <form onSubmit={handleSave} className="sk v2 bg-card p-6 sm:p-8 flex flex-col gap-6">
              {/* Preferred Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="callName" className="text-sm font-semibold text-ink">
                  Preferred name *
                </label>
                <input
                  id="callName"
                  type="text"
                  value={callName}
                  onChange={(e) => setCallName(e.target.value)}
                  maxLength={40}
                  className="field"
                  required
                />
              </div>

              {/* Pronouns */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  Pronouns
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {PRONOUNS.map((o, i) => {
                    const isSelected = pronouns === o.text;
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => selectSingle(pronouns, setPronouns, o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
                {pronouns === OTHER && (
                  <div className="mt-2 uinput">
                    <input
                      id="pronounsOther"
                      type="text"
                      placeholder="Your pronouns..."
                      value={pronounsOther}
                      onChange={(e) => setPronounsOther(e.target.value)}
                      maxLength={30}
                    />
                  </div>
                )}
              </div>

              {/* Age Range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  Age range
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {AGE_RANGES.map((o, i) => {
                    const isSelected = age === o.text;
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => selectSingle(age, setAge, o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fun Fact */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fact" className="text-sm font-semibold text-ink">
                  A fun fact about you
                </label>
                <input
                  id="fact"
                  type="text"
                  value={fact}
                  onChange={(e) => setFact(e.target.value)}
                  placeholder="e.g. I bake when I cannot sleep."
                  maxLength={100}
                  className="field"
                />
              </div>

              {/* Hobbies */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  Hobbies
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {HOBBIES.map((o, i) => {
                    const isSelected = selectedHobbies.includes(o.text);
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => toggleMultiHobbies(o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
                {selectedHobbies.includes(OTHER) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {hobbiesOther.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {hobbiesOther.map((h) => (
                          <button
                            type="button"
                            key={h}
                            onClick={() => setHobbiesOther(hobbiesOther.filter((x) => x !== h))}
                            title={`Remove "${h}"`}
                            className="sk thin chip-opt sel text-sm py-1 px-3"
                            style={{ gap: 8 }}
                          >
                            {h} <span className="opacity-80">×</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="uinput">
                      <input
                        type="text"
                        placeholder="Add a custom hobby..."
                        value={newHobby}
                        onChange={(e) => setNewHobby(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = newHobby.trim();
                            if (val && !hobbiesOther.includes(val)) {
                              setHobbiesOther([...hobbiesOther, val]);
                            }
                            setNewHobby("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => {
                          const val = newHobby.trim();
                          if (val && !hobbiesOther.includes(val)) {
                            setHobbiesOther([...hobbiesOther, val]);
                          }
                          setNewHobby("");
                        }}
                        disabled={!newHobby.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cultural Background */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  Cultural background
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {CULTURAL.map((o, i) => {
                    const isSelected = cultural === o.text;
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => selectSingle(cultural, setCultural, o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
                {cultural === OTHER && (
                  <div className="mt-2 uinput">
                    <input
                      id="culturalOther"
                      type="text"
                      placeholder="Your cultural background..."
                      value={culturalOther}
                      onChange={(e) => setCulturalOther(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                )}
              </div>

              {/* Who you lost */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  Who did you lose?
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {WHO_LOST.map((o, i) => {
                    const isSelected = whoLost === o.text;
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => selectSingle(whoLost, setWhoLost, o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
                {whoLost === OTHER && (
                  <div className="mt-2 uinput">
                    <input
                      id="whoLostOther"
                      type="text"
                      placeholder="Who did you lose..."
                      value={whoLostOther}
                      onChange={(e) => setWhoLostOther(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                )}
              </div>

              {/* Recency */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">
                  How recently was your loss?
                </label>
                <div className="flex flex-wrap gap-2.5 mt-0.5">
                  {RECENCY.map((o, i) => {
                    const isSelected = recency === o.text;
                    return (
                      <button
                        type="button"
                        key={o.text}
                        onClick={() => selectSingle(recency, setRecency, o.text)}
                        className={`sk thin soft ${VARY[i % 3]} chip-opt ${
                          isSelected ? "sel" : ""
                        } ${o.skip ? "skip" : ""}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {successMessage && (
                <p role="alert" className="text-xs text-center font-semibold [color:var(--calm-ink)]">
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p role="alert" className="text-xs text-center font-semibold text-warm-ink">
                  {errorMessage}
                </p>
              )}

              <div className="flex items-center gap-3 border-t-2 border-dashed border-line pt-4 mt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn warm sm cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save details"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="btn ghost sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
