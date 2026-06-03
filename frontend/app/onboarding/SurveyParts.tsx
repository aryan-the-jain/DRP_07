import { useState, type ReactNode } from "react";

import { Icon, IconName } from "./Icon";

// Interactive ports of the design's presentational question parts (wf-survey.jsx).
// The look is faithful; the wiring is real controlled inputs / buttons.

const VARY = ["", "v2", "v3"] as const;

// "why we ask" line — trauma-informed transparency, always visible.
export function Why({ children }: { children: ReactNode }) {
  return (
    <div className="why">
      <Icon name={IconName.Heart} size={15} c="var(--calm)" /> {children}
    </div>
  );
}

// A single question: title (+ optional tag) and the "why" line above its body.
export function Qn({
  q,
  why,
  optional,
  children,
}: {
  q: string;
  why?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: why ? 4 : 12,
        }}
      >
        <span className="h-title" style={{ fontSize: 24 }}>
          {q}
        </span>
        {optional && (
          <span className="leader" style={{ color: "var(--calm)" }}>
            optional
          </span>
        )}
      </div>
      {why && (
        <div style={{ marginBottom: 13 }}>
          <Why>{why}</Why>
        </div>
      )}
      {children}
    </div>
  );
}

// Section heading with the wavy hand-drawn underline.
export function SectionHead({
  title,
  sub,
  optional,
}: {
  title: string;
  sub?: string;
  optional?: boolean;
}) {
  return (
    <div style={{ margin: "0 0 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="h-title uline" style={{ fontSize: 26 }}>
          {title}
        </span>
        {optional && (
          <span className="leader" style={{ color: "var(--calm)" }}>
            optional
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 15.5, color: "var(--muted)", marginTop: 10 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ---- text inputs ----
export function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sk field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function UnderlineField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="uinput">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

// A typed field that collects many free-text entries — type one and press
// Enter (or Add). Each becomes a removable chip. Used for the "Other" hobbies.
export function TagField({
  id,
  label,
  placeholder,
  values,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
    }
    setDraft("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      {values.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 11,
            marginBottom: 12,
          }}
        >
          {values.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => remove(v)}
              title={`Remove “${v}”`}
              className="sk thin chip-opt sel"
              style={{ gap: 8 }}
            >
              {v}
              <span aria-hidden style={{ opacity: 0.85 }}>
                ×
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="uinput">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="btn ghost"
          style={{ fontSize: 14, padding: "5px 14px" }}
          onClick={add}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ---- stacked options (marker + colour) ----
export type Choice = {
  text: string;
  skip?: boolean;
};

export function Opt({
  text,
  selected,
  multi,
  skip,
  vary = 0,
  onClick,
}: {
  text: string;
  selected: boolean;
  multi?: boolean;
  skip?: boolean;
  vary?: number;
  onClick: () => void;
}) {
  const v = VARY[vary % 3];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`sk ${v} opt ${multi ? "multi" : "single"} ${
        selected ? "sel" : ""
      } ${skip ? "skip" : ""}`}
    >
      <span className="ind">
        {selected && <Icon name={IconName.Check} size={14} c="#fff" sw={2.6} />}
      </span>
      <span>{text}</span>
    </button>
  );
}

export function OptList({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {children}
    </div>
  );
}

// ---- inline chips (colour-only selection, no marker) ----
export function OptChips({
  items,
  isSelected,
  onToggle,
}: {
  items: Choice[];
  isSelected: (text: string) => boolean;
  onToggle: (text: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 11 }}>
      {items.map((o, i) => {
        const selected = isSelected(o.text);
        return (
          <button
            type="button"
            key={o.text}
            onClick={() => onToggle(o.text)}
            aria-pressed={selected}
            className={`sk thin soft ${VARY[i % 3]} chip-opt ${
              selected ? "sel" : ""
            } ${o.skip ? "skip" : ""}`}
          >
            {o.text}
          </button>
        );
      })}
    </div>
  );
}
