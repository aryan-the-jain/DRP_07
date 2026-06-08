"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { LineIcon } from "../components/DesignPrimitives";
import { ParticipantProfileModal } from "../components/ParticipantProfileModal";
import { Sidebar } from "../components/Sidebar";
import { fallbackApiUrl, fetchGroup, fetchParticipants, getParticipantId } from "../lib/api";
import { Participant, SupportGroup } from "../lib/types";
import { ThisWeekCard } from "./ThisWeekCard";
import { WeatherCheckIn } from "./WeatherCheckIn";

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
  const [dateLabel, setDateLabel] = useState("");

  // Format date client-side to avoid hydration mismatch
  useEffect(() => {
    const today = new Date();
    const day = today.toLocaleDateString("en-GB", { weekday: "long" });
    const date = today.getDate();
    const month = today.toLocaleDateString("en-GB", { month: "long" });
    setTimeout(() => {
      setDateLabel(`${day}, ${date} ${month}`);
    }, 0);
  }, []);

  useEffect(() => {
    const id = getParticipantId();
    if (!id) {
      router.push("/login");
      return;
    }

    let active = true;

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
  }, [router, apiUrl]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedParticipant(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const self = participants.find((p) => p.id === getParticipantId());
  const firstName = self?.displayName?.split(" ")[0] ?? "";

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-paper text-ink">
      <Sidebar activeTab="home" />

      {/* Main Area */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
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
              {/* Header Greeting */}
              <div>
                <span className="scrawl text-lg text-muted block mb-1">
                  {dateLabel || "Take your time"}
                </span>
                <h1 className="scrawl text-4xl text-ink font-semibold">
                  {firstName ? `Take your time, ${firstName}.` : "Take your time."}
                </h1>
              </div>

              {/* Weather Check-in Widget (Progressive Disclosure) */}
              <WeatherCheckIn />

              {/* Meetings Section */}
              <div className="flex flex-col gap-3">
                <span className="leader">This week · 1 meeting</span>
                <ThisWeekCard
                  group={group}
                  participants={participants}
                  onOpenProfile={setSelectedParticipant}
                  onEnterRoom={() => router.push("/")}
                />
              </div>

              {/* Invitations Section */}
              <div className="flex flex-col gap-3">
                <span className="leader">A gentle invitation</span>
                <section className="sk v2 bg-card p-5 sm:p-6 flex flex-col gap-4">
                  <div>
                    <span className="leader flex items-center gap-1.5 [color:var(--warm)] mb-1">
                      <LineIcon name="mail" size={14} /> An invitation for you
                    </span>
                    <h3 className="h-title text-2.5xl text-ink">Sunday Mornings</h3>
                    <p className="text-[14.5px] text-muted leading-relaxed mt-1">
                      Grazia thought you might feel at home here.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip sm">
                      <LineIcon name="clock" size={14} className="text-muted" /> Sun - 10:30
                    </span>
                    <span className="chip sm">
                      <LineIcon name="people" size={14} className="text-muted" /> 4 so far
                    </span>
                    <span className="chip sm calm">
                      facilitator - Grazia M.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-line pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => alert("Tell me more coming soon — take your time.")}
                      className="btn warm sm cursor-pointer"
                    >
                      Tell me more
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Maybe later — nothing happens until you say yes.")}
                      className="btn ghost sm cursor-pointer"
                    >
                      Maybe later
                    </button>
                    <span className="text-xs text-faint ml-auto sm:ml-2 italic">
                      nothing happens until you say yes
                    </span>
                  </div>
                </section>
              </div>

              {/* Quiet Space Doorway */}
              <div className="flex flex-col gap-3">
                <span className="leader">Whenever you need</span>
                <section
                  className="sk v3 p-5 sm:p-6"
                  style={{
                    borderColor: "var(--calm)",
                    background: "var(--calm-soft)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <LineIcon name="quiet" size={30} className="[color:var(--calm)] shrink-0" />
                      <div>
                        <h2 className="h-title text-2xl text-[var(--calm-ink)]">
                          Step into a quiet space
                        </h2>
                        <p className="mt-1 text-[15px] leading-relaxed text-[var(--calm-ink)]">
                          here whenever you need it
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => router.push("/quiet")}
                        className="btn calm inline-flex items-center gap-2 cursor-pointer"
                      >
                        Enter
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/quiet")}
                        className="btn ghost sm cursor-pointer"
                        style={{ borderColor: "var(--calm)", color: "var(--calm-ink)" }}
                      >
                        Breathe · Write · Sit
                      </button>
                    </div>
                  </div>
                </section>
              </div>
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
    </main>
  );
}
