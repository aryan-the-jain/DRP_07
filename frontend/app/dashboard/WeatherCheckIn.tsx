"use client";

import { useState } from "react";

// A gentle daily check-in: pick the "weather" that matches how you feel, then
// (optionally) say a little about why. Nothing here is stored — it's a private,
// low-pressure moment, so the answers live only in local state.
type Weather = {
  id: string;
  emoji: string;
  label: string;
};

const WEATHERS: Weather[] = [
  { id: "sunny", emoji: "☀️", label: "Sunny" },
  { id: "bright", emoji: "🌤️", label: "Brighter" },
  { id: "cloudy", emoji: "⛅", label: "Cloudy" },
  { id: "rainy", emoji: "🌧️", label: "Rainy" },
  { id: "stormy", emoji: "⛈️", label: "Stormy" },
  { id: "foggy", emoji: "🌫️", label: "Foggy" },
];

export function WeatherCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");

  const chosen = WEATHERS.find((weather) => weather.id === selected);

  return (
    <section className="sk soft bg-card p-5 sm:p-6">
      <p className="leader [color:var(--warm)]">A small check-in</p>
      <h2 className="h-title mt-1 text-2xl text-ink">
        How are you feeling today?
      </h2>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">
        If your mood were the weather right now, what would it be? There&apos;s no
        right answer.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {WEATHERS.map((weather) => {
          const isActive = weather.id === selected;
          return (
            <button
              key={weather.id}
              type="button"
              onClick={() =>
                setSelected((current) =>
                  current === weather.id ? null : weather.id,
                )
              }
              aria-pressed={isActive}
              className={`chip inline-flex items-center gap-2 text-[15px] transition ${
                isActive ? "warm" : "hover:bg-warm-soft"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">
                {weather.emoji}
              </span>
              {weather.label}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="mt-5 animate-fadeIn">
          <label
            htmlFor="weather-reflection"
            className="text-[15px] leading-relaxed text-ink"
          >
            <span aria-hidden className="mr-1">
              {chosen.emoji}
            </span>
            What made it feel{" "}
            <span className="font-semibold">{chosen.label.toLowerCase()}</span>{" "}
            today? Only if you&apos;d like to share.
          </label>
          <textarea
            id="weather-reflection"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={3}
            placeholder="Write as much or as little as you like…"
            className="field mt-2 w-full resize-none border-2 border-dashed [border-color:var(--line)] bg-paper"
          />
          <p className="mt-1.5 text-xs text-faint">
            This stays just with you — it isn&apos;t saved or shared.
          </p>
        </div>
      )}
    </section>
  );
}
