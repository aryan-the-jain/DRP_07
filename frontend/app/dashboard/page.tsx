"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BrandMark, LineIcon } from "../components/DesignPrimitives";
import { ParticipantProfileModal } from "../components/ParticipantProfileModal";
import { fallbackApiUrl, fetchGroup, fetchParticipants, participantId } from "../lib/api";
import { Participant, SupportGroup } from "../lib/types";
import { ThisWeekCard } from "./ThisWeekCard";
import { WeatherCheckIn } from "./WeatherCheckIn";

// The dashboard bridges onboarding and the chat room: a calm home base with a
// warm greeting, a gentle daily check-in, the upcoming session, and a doorway
// into the quiet space. It only reads from the backend.
export default function DashboardPage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    // Defer the load so it doesn't setState synchronously inside the effect
    // body (matches the chat room's loadRoom pattern).
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setErrorMessage("");

      Promise.all([fetchGroup(apiUrl), fetchParticipants(apiUrl)])
        .then(([groupData, participantsData]) => {
          if (!active) return;
          setGroup(groupData);
          setParticipants(participantsData);
        })
        .catch(() => {
          if (active)
            setErrorMessage("We couldn't load your space. Please try again.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [apiUrl]);

  // Close the profile modal on Escape, matching the chat room.
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedParticipant(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const self = participants.find((p) => p.id === participantId);
  const firstName = self?.displayName?.split(" ")[0] ?? "";

  return (
    <main className="h-screen overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="panel relative mx-auto flex h-full min-h-0 max-w-4xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <header className="shrink-0 border-b-2 border-dashed border-line bg-card p-4 sm:p-5">
          <BrandMark />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-card px-4 py-6 sm:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            {isLoading ? (
              <p className="py-12 text-center text-[15px] text-muted">
                Setting up your space…
              </p>
            ) : errorMessage ? (
              <div
                role="alert"
                className="sk thin soft bg-paper px-4 py-3 text-center text-[15px] text-warm-ink"
              >
                {errorMessage}
              </div>
            ) : (
              <>
                {/* Greeting */}
                <div>
                  <p className="leader [color:var(--warm)]">Welcome back</p>
                  <h1 className="h-title mt-1 text-3xl text-ink sm:text-4xl">
                    {firstName
                      ? `It's good to have you here, ${firstName}.`
                      : "It's good to have you here."}
                  </h1>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    This is your calm corner. Take a breath, see how you&apos;re
                    doing, and step in whenever you feel ready — there&apos;s no
                    rush.
                  </p>
                </div>

                <WeatherCheckIn />

                <ThisWeekCard
                  group={group}
                  participants={participants}
                  onOpenProfile={setSelectedParticipant}
                  onEnterRoom={() => router.push("/")}
                />

                {/* Quiet space doorway */}
                <section
                  className="sk v3 p-5 sm:p-6"
                  style={{
                    borderColor: "var(--calm)",
                    background: "var(--calm-soft)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <LineIcon name="quiet" size={30} className="[color:var(--calm)]" />
                      <div>
                        <h2 className="h-title text-2xl text-[var(--calm-ink)]">
                          A quiet space, just for you
                        </h2>
                        <p className="mt-1 text-[15px] leading-relaxed text-[var(--calm-ink)]">
                          Somewhere private to pause, breathe, or write down
                          whatever you&apos;re carrying. It&apos;s open whenever
                          you need it.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/quiet")}
                      className="btn calm inline-flex items-center gap-2"
                    >
                      Step into the quiet space
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {selectedParticipant && (
          <ParticipantProfileModal
            participant={selectedParticipant}
            onClose={() => setSelectedParticipant(null)}
          />
        )}
      </section>
    </main>
  );
}
