import { Fragment, useState } from "react";

import { Icon } from "./Icon";

// Shard progress bar — sections shown as shards on a thread, described not
// numbered. The LINE is the journey: it fills orange up to wherever you are.
// The SHARD is whether that section is genuinely done:
//   • todo    — not reached yet (small dashed grey diamond)
//   • active  — where you are now (open warm diamond + dashed halo)
//   • done    — actually answered (filled warm diamond + check)
//   • skipped — passed but left unanswered (hollow warm outline, "come back any time")
export type ShardStep = {
  label: string;
  desc: string;
};

export const ONBOARDING_SECTIONS: ShardStep[] = [
  { label: "About you", desc: "who we’re talking to" },
  { label: "In your time", desc: "only if you want" },
  { label: "What helps", desc: "how to support you" },
];

type ShardState = "todo" | "active" | "done" | "skipped";

function Shard({
  state,
  label,
  desc,
  hovered,
  onSelect,
  onHover,
  onLeave,
}: {
  state: ShardState;
  label: string;
  desc: string;
  hovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const labelColor =
    state === "todo"
      ? "var(--muted)"
      : state === "done"
        ? "var(--ink)"
        : "var(--warm)";
  const shownDesc = state === "skipped" ? "come back any time" : desc;

  return (
    <button
      type="button"
      className="shard"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      title={`Go to “${label}”`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 96,
        flex: "0 0 auto",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--hand)",
      }}
    >
      <div
        className="node"
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,.14))",
          transform: hovered ? "translateY(-4px) scale(1.12)" : "none",
        }}
      >
        {state === "active" && (
          <div
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              transform: "rotate(45deg)",
              border: "2px dashed var(--warm)",
              borderRadius: 6,
              opacity: 0.55,
            }}
          />
        )}
        {state === "todo" && (
          <div
            style={{
              width: 19,
              height: 19,
              transform: "rotate(45deg)",
              border: "2px solid var(--line)",
              background: "var(--warm-soft)",
              borderRadius: 4,
            }}
          />
        )}
        {state === "skipped" && (
          <div
            style={{
              width: 22,
              height: 22,
              transform: "rotate(45deg)",
              border: "2px solid var(--warm)",
              background: "transparent",
              borderRadius: 4,
            }}
          />
        )}
        {state === "active" && (
          <div
            style={{
              width: 27,
              height: 27,
              transform: "rotate(45deg)",
              border: "2.5px solid var(--warm)",
              background: "var(--warm-soft)",
              borderRadius: 5,
            }}
          />
        )}
        {state === "done" && (
          <div
            style={{
              width: 25,
              height: 25,
              transform: "rotate(45deg)",
              background: "var(--warm)",
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ transform: "rotate(-45deg)", display: "flex" }}>
              <Icon name="check" size={14} c="#fff" sw={2.6} />
            </div>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: 5 }}>
        <span
          className="slabel"
          style={{ fontSize: 16.5, lineHeight: 1, color: labelColor }}
        >
          {label}
        </span>
        <div
          style={{
            fontSize: 12.5,
            color: state === "skipped" ? "var(--calm)" : "var(--faint)",
            marginTop: 5,
            fontStyle: state === "skipped" ? "italic" : "normal",
          }}
        >
          {shownDesc}
        </div>
      </div>
    </button>
  );
}

function Conn({ filled }: { filled: boolean }) {
  return (
    <div style={{ flex: 1, height: 46, position: "relative", minWidth: 24 }}>
      <div
        style={{
          position: "absolute",
          top: 22,
          left: -6,
          right: -6,
          borderTop: filled
            ? "2.5px solid var(--warm)"
            : "2px dashed var(--line)",
        }}
      />
    </div>
  );
}

type ShardBarProps = {
  current?: number;
  completed?: boolean[];
  steps?: ShardStep[];
  onSelect?: (index: number) => void;
};

export function ShardBar({
  current = 0,
  completed = [],
  steps = ONBOARDING_SECTIONS,
  onSelect,
}: ShardBarProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const stateFor = (i: number): ShardState => {
    if (i === current) return "active";
    if (completed[i]) return "done";
    if (i < current) return "skipped";
    return "todo";
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {steps.map((s, i) => (
        <Fragment key={s.label}>
          <Shard
            state={stateFor(i)}
            label={s.label}
            desc={s.desc}
            hovered={hovered === i}
            onSelect={() => onSelect?.(i)}
            onHover={() => setHovered(i)}
            onLeave={() => setHovered(null)}
          />
          {/* the line is the journey — orange up to wherever you are */}
          {i < steps.length - 1 && <Conn filled={i < current} />}
        </Fragment>
      ))}
    </div>
  );
}
