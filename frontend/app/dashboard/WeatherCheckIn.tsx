"use client";

import { useState, type CSSProperties } from "react";

// A gentle daily check-in: pick the "weather" that matches how you feel, then
// (optionally) keep a private reflection about why. Nothing here is stored yet —
// it's a private, low-pressure moment, so the answers live only in local state.

// Each sky carries its own subtle accent — desaturated, cosy, never neon — so
// the icons read as finished little drawings rather than grey outlines.
type SkyKey = "clear" | "sun" | "cloud" | "rain" | "storm" | "fog";

type SkyColour = { ink: string; soft: string; tile: string };

const WX: Record<SkyKey, SkyColour> = {
  clear: { ink: "oklch(0.64 0.13 64)", soft: "oklch(0.9 0.07 82)", tile: "oklch(0.95 0.035 82)" }, // amber
  sun: { ink: "oklch(0.64 0.12 70)", soft: "oklch(0.9 0.06 85)", tile: "oklch(0.95 0.03 85)" }, // amber + cloud
  cloud: { ink: "oklch(0.57 0.045 248)", soft: "oklch(0.9 0.025 248)", tile: "oklch(0.95 0.015 248)" }, // slate blue
  rain: { ink: "oklch(0.55 0.1 242)", soft: "oklch(0.89 0.045 242)", tile: "oklch(0.95 0.025 242)" }, // blue
  storm: { ink: "oklch(0.5 0.1 292)", soft: "oklch(0.88 0.045 292)", tile: "oklch(0.95 0.025 292)" }, // violet
  fog: { ink: "oklch(0.56 0.025 256)", soft: "oklch(0.9 0.015 256)", tile: "oklch(0.95 0.01 256)" }, // muted grey-blue
};

// Feelings mapped onto weather — warmer & less clinical than mood words.
type Weather = { key: SkyKey; sky: string; feel: string };

const WEATHERS: Weather[] = [
  { key: "clear", sky: "Clear skies", feel: "bright, lighter today" },
  { key: "sun", sky: "Some sun", feel: "a little hopeful" },
  { key: "cloud", sky: "Overcast", feel: "heavy, low" },
  { key: "rain", sky: "Rain", feel: "tearful, close to it" },
  { key: "storm", sky: "Stormy", feel: "all at once" },
  { key: "fog", sky: "Fog", feel: "numb, far away" },
];

const cloudPath =
  "M17.2 16.6H8a3.6 3.6 0 0 1-.5-7.17 4.9 4.9 0 0 1 9.2-1.1 3.4 3.4 0 0 1 .5 8.27z";

// Hand-drawn weather glyph — two-tone (soft fill + accent stroke), a distinct
// silhouette per sky. `mute` softens it slightly for the unselected state but
// never strips the colour.
function WeatherGlyph({
  kind,
  size = 40,
  mute = false,
}: {
  kind: SkyKey;
  size?: number;
  mute?: boolean;
}) {
  const c = WX[kind];
  const ink = c.ink;
  const soft = c.soft;
  const s = {
    fill: "none",
    stroke: ink,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  let body;
  if (kind === "clear") {
    body = (
      <>
        <path
          {...s}
          d="M12 2.6v2.5M12 18.9v2.5M2.6 12h2.5M18.9 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M5 19l1.8-1.8"
        />
        <circle cx="12" cy="12" r="4.7" {...s} fill={soft} />
      </>
    );
  } else if (kind === "sun") {
    body = (
      <>
        <g>
          <path {...s} d="M7.3 1.9v1.7M2 7.2h1.7M3.4 3.4 4.6 4.6M11.2 3.4 10 4.6" />
          <circle cx="7.3" cy="7.2" r="3.1" {...s} fill={soft} />
        </g>
        <path
          d={cloudPath}
          fill={WX.cloud.soft}
          stroke={WX.cloud.ink}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </>
    );
  } else if (kind === "cloud") {
    body = (
      <>
        <path
          d="M14.6 13.4H7.7a3 3 0 0 1-.4-5.97 4.1 4.1 0 0 1 7.7-.9 2.85 2.85 0 0 1 .4 5.67z"
          transform="translate(2 3)"
          fill={soft}
          opacity="0.7"
          stroke={ink}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d={cloudPath} {...s} fill={soft} />
      </>
    );
  } else if (kind === "rain") {
    body = (
      <>
        <path d={cloudPath} {...s} fill={soft} transform="translate(0 -1)" />
        <path
          d="M8 16l-1.1 3M12 16.4l-1.1 3M16 16l-1.1 3"
          stroke={ink}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  } else if (kind === "storm") {
    body = (
      <>
        <path
          {...s}
          fill={soft}
          d={cloudPath.replace("16.6", "13.6")}
          transform="translate(0 -1)"
        />
        <path
          d="M12.7 13.6l-3.4 4.7h2.5l-1.1 3.6 4.2-5.2h-2.7l1.3-3.1z"
          fill="oklch(0.74 0.15 75)"
          stroke="oklch(0.6 0.14 64)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </>
    );
  } else {
    // fog
    body = (
      <>
        <path
          {...s}
          fill={soft}
          d="M14.8 11.5H8.4a3.1 3.1 0 0 1-.4-6.17 4.2 4.2 0 0 1 7.9-.95 2.9 2.9 0 0 1 .4 5.77z"
          transform="translate(0 -0.5)"
        />
        <path
          d="M5 14.4h12M7 17.4h11M6 20.2h9"
          stroke={ink}
          strokeWidth="1.9"
          strokeLinecap="round"
          opacity="0.85"
          fill="none"
        />
      </>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "block", flex: "0 0 auto", opacity: mute ? 0.92 : 1 }}
    >
      {body}
    </svg>
  );
}

// A small terracotta spark, marking the check-in as a warm, gentle moment.
function SparkIcon({ size = 22, c = "var(--warm)", style }: { size?: number; c?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" style={{ display: "block", flex: "0 0 auto", ...style }}>
      <path
        fill="none"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 3c.7 4 2 5.3 6 6-4 .7-5.3 2-6 6-.7-4-2-5.3-6-6 4-.7 5.3-2 6-6Z"
      />
    </svg>
  );
}

// The onboarding survey's green "optional · skip freely" pill, recreated inline
// (the .opt-badge class is scoped to .onboarding-root and isn't available here).
function OptionalBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-hand)",
        fontSize: 15,
        lineHeight: 1,
        color: "var(--calm-ink)",
        background: "var(--calm-soft)",
        border: "1.6px solid var(--calm)",
        padding: "4px 11px 5px",
        borderRadius: 30,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          border: "1.6px solid var(--calm)",
        }}
      />
      optional · skip freely
    </span>
  );
}

// ---- one weather tile (selectable, square) ----
function WeatherTile({
  w,
  selected,
  dim,
  onPick,
}: {
  w: Weather;
  selected: boolean;
  dim: boolean;
  onPick: (key: SkyKey) => void;
}) {
  const c = WX[w.key];
  return (
    <button
      type="button"
      onClick={() => onPick(w.key)}
      aria-pressed={selected}
      className={"sk thin" + (selected ? "" : " soft weather-tile")}
      style={{
        flex: 1,
        minWidth: 0,
        cursor: "pointer",
        textAlign: "center",
        padding: "15px 8px 13px",
        // Selected tiles carry their own sky colour inline; unselected tiles
        // leave background/border to the .weather-tile class so the hover grey
        // (which inline styles would override) can take effect.
        ...(selected
          ? { background: c.tile, borderColor: c.ink, borderWidth: 2.4 }
          : { borderWidth: 1.6 }),
        opacity: dim ? 0.55 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-hand)",
      }}
    >
      <WeatherGlyph kind={w.key} size={42} mute={!selected} />
      <span
        className="h-title"
        style={{ fontSize: 16.5, color: selected ? c.ink : "var(--ink)", lineHeight: 1 }}
      >
        {w.sky}
      </span>
      <span style={{ fontSize: 12.5, color: "var(--faint)", lineHeight: 1.05 }}>
        {w.feel}
      </span>
    </button>
  );
}

export function WeatherCheckIn() {
  const [picked, setPicked] = useState<SkyKey | null>(null);
  const [reflectOpen, setReflectOpen] = useState(false);
  const [reflection, setReflection] = useState("");

  const chosen = WEATHERS.find((w) => w.key === picked);

  // Tapping a tile toggles it: re-picking the current sky clears the check-in
  // (and closes the reflection); picking a new one opens the reflection.
  function pick(key: SkyKey) {
    if (picked === key) {
      setPicked(null);
      setReflectOpen(false);
      return;
    }
    setPicked(key);
    setReflectOpen(true);
  }

  return (
    <section className="sk v3" style={{ padding: "20px 24px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <SparkIcon size={22} c="var(--warm)" style={{ marginTop: 4 }} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 11,
            }}
          >
            <span className="h-title" style={{ fontSize: 24, lineHeight: 1.05 }}>
              What&apos;s the weather like inside today?
            </span>
            <OptionalBadge />
          </div>
          <div
            style={{
              fontSize: 15,
              color: "var(--muted)",
              marginTop: 4,
              lineHeight: 1.4,
              maxWidth: 560,
            }}
          >
            Some days are bright, some are stormy, most sit somewhere in between.
            Pick the sky that feels closest — grief moves like weather, and it
            always passes through.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
        {WEATHERS.map((w) => (
          <WeatherTile
            key={w.key}
            w={w}
            selected={picked === w.key}
            dim={picked !== null && picked !== w.key}
            onPick={pick}
          />
        ))}
      </div>

      {/* reflection follow-up */}
      {reflectOpen && chosen && (
        <div
          style={{
            marginTop: 18,
            borderTop: "2px dashed var(--line)",
            paddingTop: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 4,
            }}
          >
            <WeatherGlyph kind={chosen.key} size={26} />
            <span style={{ fontSize: 14.5, color: "var(--muted)" }}>
              Thank you for letting us know it&apos;s{" "}
              <b style={{ color: "var(--warm-ink)", fontWeight: 400 }}>
                {chosen.sky.toLowerCase()}
              </b>{" "}
              today.
            </span>
          </div>

          <div className="h-title" style={{ fontSize: 20, margin: "8px 0 3px" }}>
            What made you feel that way?
          </div>
          <div style={{ fontSize: 13.5, color: "var(--faint)", marginBottom: 10 }}>
            Only you can see this. A word, a memory, a whole paragraph — or nothing
            at all.
          </div>
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="Today the weather is like this because…"
            className="sk thin"
            style={{
              width: "100%",
              minHeight: 92,
              resize: "none",
              padding: "13px 15px",
              fontFamily: "var(--font-hand)",
              fontSize: 16,
              color: "var(--ink)",
              lineHeight: 1.4,
              background: "var(--paper)",
              borderStyle: "dashed",
              borderColor: "var(--line)",
              outline: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
            }}
          >
            {/* Placeholder for now — keeping a thought isn't wired up yet, so this
                deliberately does nothing and leaves the reflection open. */}
            <button type="button" className="btn warm" style={{ fontSize: 14 }}>
              Keep this thought
            </button>
            <button
              type="button"
              className="btn ghost"
              style={{ fontSize: 14 }}
              onClick={() => setReflectOpen(false)}
            >
              Not now
            </button>
            <div style={{ flex: 1 }} />
            <span
              style={{
                fontSize: 12.5,
                color: "var(--faint)",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              kept privately in your journal
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
