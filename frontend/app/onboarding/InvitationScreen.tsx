import { Icon, IconName } from "./Icon";
import { Screen } from "./MomentScreen";

// "A facilitator reached out" — one gentle nudge, full attention (variant 1,
// first screen, from the design's wf-invitations.jsx InviteGentle). No list to
// scan; a single, low-stakes choice. Buttons are prototype stubs for now.
export function InvitationScreen() {
  return (
    <Screen>
      <span
        className="leader"
        style={{ color: "var(--warm)", textAlign: "center" }}
      >
        A facilitator reached out
      </span>
      <div
        className="h-title"
        style={{
          fontSize: 25,
          textAlign: "center",
          margin: "8px 0 4px",
          lineHeight: 1.1,
        }}
      >
        Sam thought you might
        <br />
        feel at home here.
      </div>

      <div className="sk v2" style={{ padding: "18px 20px", marginTop: 16 }}>
        <div className="h-title" style={{ fontSize: 23 }}>
          Sunday Mornings
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 7,
            margin: "10px 0 12px",
          }}
        >
          <span className="chip">
            <Icon name={IconName.Clock} size={14} c="var(--muted)" /> Sun · 10:30
          </span>
          <span className="chip calm">Sam M.</span>
          <span className="chip">
            <Icon name={IconName.People} size={14} c="var(--muted)" /> 4 so far
          </span>
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.4,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          A newer group, finding its feet together. People who lost someone
          recently.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
          marginTop: 16,
        }}
      >
        <button
          type="button"
          className="btn warm"
          style={{ justifyContent: "center" }}
        >
          Tell me more
        </button>
        <div style={{ display: "flex", gap: 9 }}>
          <button
            type="button"
            className="btn ghost"
            style={{ flex: 1, justifyContent: "center", fontSize: 14 }}
          >
            Maybe later
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ flex: 1, justifyContent: "center", fontSize: 14 }}
          >
            Not this one
          </button>
        </div>
      </div>
    </Screen>
  );
}
