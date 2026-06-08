"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Sidebar } from "../components/Sidebar";
import { fallbackApiUrl, fetchOnboarding, saveOnboarding } from "../lib/api";
import { OnboardingStatus, OnboardingPayload } from "../lib/types";

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
  const [age, setAge] = useState("");
  const [fact, setFact] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [culturalBackground, setCulturalBackground] = useState("");
  const [griefRecency, setGriefRecency] = useState("");
  const [whoLost, setWhoLost] = useState("");

  useEffect(() => {
    let active = true;

    fetchOnboarding(apiUrl)
      .then((data) => {
        if (!active) return;
        if (data) {
          setCallName(data.callName || "");
          setPronouns(data.pronouns || "");
          setAge(data.age || "");
          setFact(data.fact || "");
          setHobbies(data.hobbies ? data.hobbies.join(", ") : "");
          setCulturalBackground(data.culturalBackground || "");
          setGriefRecency(data.griefRecency || "");
          setWhoLost(data.whoLost || "");
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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!callName.trim()) {
      setErrorMessage("Please enter a preferred name.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload: OnboardingPayload = {
      callName: callName.trim(),
      pronouns: pronouns.trim() || null,
      age: age.trim() || null,
      fact: fact.trim(),
      hobbies: hobbies.split(",").map((h) => h.trim()).filter((h) => h.length > 0),
      culturalBackground: culturalBackground.trim() || null,
      griefRecency: griefRecency.trim() || null,
      whoLost: whoLost.trim() || null,
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
            <form onSubmit={handleSave} className="sk v2 bg-card p-6 sm:p-8 flex flex-col gap-5">
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pronouns" className="text-sm font-semibold text-ink">
                  Pronouns
                </label>
                <input
                  id="pronouns"
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="e.g. She/her, They/them"
                  maxLength={30}
                  className="field"
                />
              </div>

              {/* Age Range */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-sm font-semibold text-ink">
                  Age range
                </label>
                <select
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="field appearance-none pr-8 bg-no-repeat bg-[right_12px_center]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238d8478' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
                    backgroundSize: '16px'
                  }}
                >
                  <option value="">Select range...</option>
                  <option value="Under 18">Under 18</option>
                  <option value="18–21">18–21</option>
                  <option value="22–25">22–25</option>
                  <option value="26–30">26–30</option>
                  <option value="31+">31+</option>
                  <option value="I’d rather not say">I’d rather not say</option>
                </select>
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="hobbies" className="text-sm font-semibold text-ink">
                  Hobbies (comma-separated)
                </label>
                <input
                  id="hobbies"
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="e.g. Music, Cooking, Reading"
                  className="field"
                />
              </div>

              {/* Cultural Background */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cultural" className="text-sm font-semibold text-ink">
                  Cultural background
                </label>
                <input
                  id="cultural"
                  type="text"
                  value={culturalBackground}
                  onChange={(e) => setCulturalBackground(e.target.value)}
                  placeholder="e.g. White / European"
                  maxLength={50}
                  className="field"
                />
              </div>

              {/* Who you lost */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="whoLost" className="text-sm font-semibold text-ink">
                  Who did you lose?
                </label>
                <input
                  id="whoLost"
                  type="text"
                  value={whoLost}
                  onChange={(e) => setWhoLost(e.target.value)}
                  placeholder="e.g. A family member"
                  maxLength={50}
                  className="field"
                />
              </div>

              {/* Recency */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="recency" className="text-sm font-semibold text-ink">
                  How recently was your loss?
                </label>
                <input
                  id="recency"
                  type="text"
                  value={griefRecency}
                  onChange={(e) => setGriefRecency(e.target.value)}
                  placeholder="e.g. Around 6 months ago"
                  maxLength={50}
                  className="field"
                />
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
