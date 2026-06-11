"use client";

// fac view — the facilitator's in-session room (Layout A: a "Privately with you" rail).
// Wired to the live group: the group stream, each member's private thread, and the parts
// of their reflection they've shared. The facilitator posts to the group and replies
// privately. A message in the rail opens that person's message view; a reflection opens
// their reflection view.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMessageTime } from "../../lib/format";
import { Avatar, DashRule, Icon, RoomHeader } from "./Primitives";
import { ConfirmPopup, Overlay } from "./Overlays";
import { Hub, type HubTab } from "./Hub";
import {
  dmsFrom,
  personFromParticipant,
  sharedReflections,
  toneFor,
  type GroupMessageResponse,
  type InboxEntryResponse,
  type Person,
  type Tone,
} from "../lib/data";
import {
  apiBase,
  endSession,
  facilitatorId,
  fetchGroupMessages,
  fetchGroups,
  fetchInbox,
  fetchParticipant,
  fetchPrivateThread,
  fetchSessionState,
  liveGroupId,
  sendGroupMessage,
  sendPrivateMessage,
  SESSION_CLOSED_FOR_WEEK,
  startSession,
} from "../lib/api";

type Mini = { id: number; name: string; tone: Tone };

function Bubble({
  m,
  sender,
  onAvatar,
}: {
  m: GroupMessageResponse;
  sender: Mini | undefined;
  onAvatar: (id: number) => void;
}) {
  const you = m.id === facilitatorId;
  const at = formatMessageTime(m.createdAt);
  if (you) {
    return (
      <div className="row" style={{ gap: 11, alignItems: "flex-end", flexDirection: "row-reverse" }}>
        <Avatar name="Sean" size={36} you />
        <div className="stack" style={{ gap: 5, alignItems: "flex-end", maxWidth: 520 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--faint)" }}>{at}</span>
            <span style={{ fontSize: 14.5, color: "var(--warm-ink)" }}>You · holding this space</span>
          </div>
          <div
            className="sk thin"
            style={{ background: "var(--warm)", borderColor: "transparent", color: "#fff", padding: "11px 16px", fontSize: 16, lineHeight: 1.45 }}
          >
            {m.body}
          </div>
        </div>
      </div>
    );
  }
  const name = sender?.name ?? "Someone";
  return (
    <div className="row" style={{ gap: 11, alignItems: "flex-start" }}>
      <Avatar name={name} size={36} tone={sender?.tone ?? toneFor(m.id)} onClick={() => onAvatar(m.id)} title={`Open ${name}'s profile`} />
      <div className="stack" style={{ gap: 5, maxWidth: 520 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="h-title" style={{ fontSize: 18, color: "var(--ink)", cursor: "pointer" }} onClick={() => onAvatar(m.id)}>
            {name}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--faint)" }}>{at}</span>
        </div>
        <div className="sk thin soft" style={{ padding: "11px 16px", fontSize: 16, lineHeight: 1.45, color: "var(--ink)" }}>
          {m.body}
        </div>
      </div>
    </div>
  );
}

// A sketchy on/off switch for the panel's visibility toggle.
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      style={{
        width: 40,
        height: 23,
        borderRadius: 20,
        border: "1.8px solid var(--ink)",
        background: on ? "var(--warm)" : "var(--card)",
        position: "relative",
        cursor: "pointer",
        transition: "background .15s",
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 1.5,
          left: on ? 18 : 2,
          width: 17,
          height: 17,
          borderRadius: "50%",
          background: "var(--paper)",
          border: "1.6px solid var(--ink)",
          transition: "left .15s",
        }}
      />
    </div>
  );
}

// One unified private item — warm/orange for a message, sky/blue for a reflection. Always
// shows a time when one is known (reflections have no shared-at column, so theirs is blank).
type FeedItem = {
  id: number;
  kind: "message" | "reflection";
  name: string;
  tone: Tone;
  at: string;
  q?: string;
  text: string;
};

function PrivateFeedItem({ item, onOpen }: { item: FeedItem; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isMsg = item.kind === "message";
  const accent = isMsg ? "var(--warm)" : "var(--sky)";
  const accentInk = isMsg ? "var(--warm-ink)" : "var(--sky-ink)";
  const tint = isMsg ? "var(--warm-soft)" : "var(--sky-soft)";
  return (
    <div
      className="sk thin"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 14px 12px 15px",
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
        cursor: "pointer",
        borderColor: accent,
        borderLeftWidth: 5,
        background: hovered ? "var(--paper)" : undefined,
        transition: "background .15s",
      }}
    >
      <Avatar name={item.name} size={36} tone={item.tone} />
      <div className="stack" style={{ gap: 4, flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 7 }}>
          <span className="h-title" style={{ fontSize: 17, color: "var(--ink)" }}>
            {item.name}
          </span>
          <span className="chip" style={{ fontSize: 10.5, padding: "1px 8px", borderColor: accent, background: tint, color: accentInk }}>
            <Icon name={isMsg ? "bubble" : "note"} size={11} c={accentInk} /> {isMsg ? "message" : "reflection"}
          </span>
          <div style={{ flex: 1 }} />
          {item.at && <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{item.at}</span>}
        </div>
        {!isMsg && item.q && <span style={{ fontSize: 12.5, color: accentInk, lineHeight: 1.35 }}>{item.q}</span>}
        <span
          style={{
            fontSize: 14,
            color: "var(--muted)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.text}
        </span>
      </div>
    </div>
  );
}

// Merge the private messages and shared reflections into one stream, newest
// first — the rail is a triage surface, so whoever wrote most recently floats
// to the top. Items without a timestamp sink to the bottom. The feed is
// rebuilt from the polled inbox every render, so it reorders as messages
// arrive.
function buildPrivateFeed(inbox: InboxEntryResponse[]): FeedItem[] {
  const dms = inbox
    .filter((e) => e.lastMessageBody)
    .map((e): FeedItem & { atIso: string | null } => ({
      id: e.participant.id,
      kind: "message",
      name: e.participant.displayName,
      tone: toneFor(e.participant.id),
      at: e.lastMessageAt ? formatMessageTime(e.lastMessageAt) : "",
      atIso: e.lastMessageAt,
      text: (e.lastMessageFromId === facilitatorId ? "You: " : "") + (e.lastMessageBody ?? ""),
    }));
  const refs = inbox
    .filter((e) => e.sharedPrivateNote || e.sharedFacilitatorNote || e.sharedFreeWriting)
    .map((e): FeedItem & { atIso: string | null } => ({
      id: e.participant.id,
      kind: "reflection",
      name: e.participant.displayName,
      tone: toneFor(e.participant.id),
      at: e.lastReflectionShareAt ? formatMessageTime(e.lastReflectionShareAt) : "",
      atIso: e.lastReflectionShareAt,
      q: e.sharedPrivateNote ? "How are you feeling now?" : e.sharedFacilitatorNote ? "What has made you come here today?" : "From their free writing",
      text: e.sharedPrivateNote ?? e.sharedFacilitatorNote ?? e.sharedFreeWriting ?? "",
    }));
  return [...dms, ...refs].sort((a, b) => {
    if (!a.atIso) return b.atIso ? 1 : 0;
    if (!b.atIso) return -1;
    return new Date(b.atIso).getTime() - new Date(a.atIso).getTime();
  });
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "100vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

type RoomModal =
  | { type: "card"; person: Person; tab: HubTab }
  | { type: "end" }
  | null;

export function ChatDrawer({ groupId = liveGroupId }: { groupId?: number }) {
  const router = useRouter();
  const apiUrl = apiBase();
  const [groupName, setGroupName] = useState("Friday Group");
  const [duration, setDuration] = useState<number | null>(null);
  const [members, setMembers] = useState<Mini[]>([]);
  const [messages, setMessages] = useState<GroupMessageResponse[]>([]);
  const [inbox, setInbox] = useState<InboxEntryResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "closed">("loading");
  const [modal, setModal] = useState<RoomModal>(null);
  const [draft, setDraft] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(440);
  const [splitterHover, setSplitterHover] = useState(false);
  const [panelCard, setPanelCard] = useState<{ person: Person; tab: HubTab } | null>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: panelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - ev.clientX;
      setPanelWidth(Math.max(300, Math.min(700, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const loadMessages = useCallback(async () => {
    try {
      setMessages(await fetchGroupMessages(apiUrl, groupId));
    } catch {
      /* keep the last good messages on a transient poll failure */
    }
  }, [apiUrl, groupId]);

  const loadInbox = useCallback(async () => {
    try {
      setInbox(await fetchInbox(apiUrl, groupId));
    } catch {
      /* leave the rail as-is on a transient failure */
    }
  }, [apiUrl, groupId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [groups, msgs, box, session] = await Promise.all([
          fetchGroups(apiUrl),
          fetchGroupMessages(apiUrl, groupId),
          fetchInbox(apiUrl, groupId),
          fetchSessionState(apiUrl, groupId).catch(() => null),
        ]);
        if (!active) return;
        const live = groups.find((g) => g.groupId === groupId);
        if (live) {
          setGroupName(live.name);
          setDuration(live.scheduledDurationMinutes);
          setMembers(
            live.members
              .filter((m) => m.role.toLowerCase() !== "facilitator")
              .map((m) => ({ id: m.id, name: m.displayName, tone: toneFor(m.id) })),
          );
        }
        // A session can only be held once per scheduled week — once it has been
        // ended, the room stays closed until next time.
        if (session?.sessionClosedForWeek) {
          setStatus("closed");
          return;
        }
        setMessages(msgs);
        setInbox(box);
        setStatus("ready");
        // Entering the room opens the session so participants can join. The backend
        // refuses if this week's session already happened (e.g. a stale deep link).
        startSession(apiUrl, groupId).catch((e: unknown) => {
          if (active && e instanceof Error && e.message === SESSION_CLOSED_FOR_WEEK) {
            setStatus("closed");
          }
        });
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [apiUrl, groupId]);

  useEffect(() => {
    const id = setInterval(() => {
      loadMessages();
      loadInbox();
    }, 5000);
    return () => clearInterval(id);
  }, [loadMessages, loadInbox]);

  // Load a member's profile + private thread + shared reflections into one enriched Person.
  const buildPerson = async (id: number): Promise<Person> => {
    const [p, thread] = await Promise.all([
      fetchParticipant(apiUrl, id),
      fetchPrivateThread(apiUrl, groupId, id),
    ]);
    const entry = inbox.find((e) => e.participant.id === id);
    return {
      ...personFromParticipant(p),
      dm: dmsFrom(thread, facilitatorId),
      reflections: entry ? sharedReflections(entry.sharedPrivateNote, entry.sharedFacilitatorNote, entry.sharedFreeWriting, entry.lastReflectionShareAt) : [],
      unread: entry?.hasUnread ? 1 : 0,
    };
  };

  // Open the 3-tab profile card as a floating pop-up (from a chat avatar), on whichever
  // tab the click implies.
  const openCard = async (id: number, tab: HubTab) => {
    try {
      setModal({ type: "card", tab, person: await buildPerson(id) });
    } catch {
      /* ignore transient fetch */
    }
  };

  // Open the same profile card in place inside the private panel (from a feed item),
  // replacing the feed until the facilitator steps back.
  const openItemInPanel = async (item: FeedItem) => {
    try {
      setPanelOpen(true);
      setPanelCard({ person: await buildPerson(item.id), tab: item.kind === "message" ? "message" : "reflections" });
    } catch {
      /* ignore transient fetch */
    }
  };

  const replyTo = async (toId: number, body: string) => {
    await sendPrivateMessage(apiUrl, groupId, facilitatorId, toId, body);
    const thread = await fetchPrivateThread(apiUrl, groupId, toId);
    const dm = dmsFrom(thread, facilitatorId);
    setModal((prev) =>
      prev && prev.type === "card" && prev.person.id === toId
        ? { ...prev, person: { ...prev.person, dm } }
        : prev,
    );
    setPanelCard((prev) =>
      prev && prev.person.id === toId ? { ...prev, person: { ...prev.person, dm } } : prev,
    );
    loadInbox();
  };

  const sendToGroup = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await sendGroupMessage(apiUrl, groupId, facilitatorId, body);
    loadMessages();
  };

  if (status === "loading") return <Centered>Opening the room…</Centered>;
  if (status === "error") return <Centered>We couldn’t reach the server.</Centered>;
  if (status === "closed")
    return (
      <Centered>
        <div className="stack" style={{ alignItems: "center", gap: 14, textAlign: "center" }}>
          <span className="h-title" style={{ fontSize: 24, color: "var(--ink)" }}>
            This week’s session has already been held.
          </span>
          <span style={{ fontSize: 15.5, maxWidth: 420, lineHeight: 1.5 }}>
            {groupName ? `${groupName} will` : "The group will"} meet again at its
            usual time next week — the room stays gently closed until then.
          </span>
          <button className="btn warm" onClick={() => router.push("/facilitator")}>
            Back to your groups
          </button>
        </div>
      </Centered>
    );

  const feed = buildPrivateFeed(inbox);
  const byId = new Map(members.map((m) => [m.id, m] as const));

  return (
    <div className="stack" style={{ height: "100vh", background: "var(--paper)", position: "relative" }}>
      <RoomHeader
        room={groupName}
        here={`${members.length} here with you`}
        mins={duration ? `${duration} minutes together` : ""}
        right={
          <button className="btn red-ghost sm" onClick={() => setModal({ type: "end" })}>
            <Icon name="x" size={15} />
            End the session
          </button>
        }
      />
      <DashRule />
      <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
        <div className="scroll" style={{ flex: 1, padding: "26px 40px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="row" style={{ gap: 11, justifyContent: "center", marginBottom: 22, color: "var(--faint)", fontSize: 14 }}>
            </div>
            {messages.length === 0 ? (
              <div className="row" style={{ justifyContent: "center", color: "var(--muted)", fontSize: 15.5 }}>
                No messages yet. You can open gently when you’re ready.
              </div>
            ) : (
              <div className="stack" style={{ gap: 18 }}>
                {messages.map((m, i) => (
                  <Bubble key={i} m={m} sender={byId.get(m.id)} onAvatar={(id) => openCard(id, "about")} />
                ))}
              </div>
            )}
          </div>
        </div>

        {panelOpen && (
          <div
            onMouseDown={onSplitterMouseDown}
            onMouseEnter={() => setSplitterHover(true)}
            onMouseLeave={() => setSplitterHover(false)}
            title="Drag to resize"
            style={{
              width: 16,
              flex: "0 0 16px",
              cursor: "col-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              userSelect: "none",
              transition: "background .15s",
            }}
          >
            <div style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: `1.5px solid ${splitterHover ? "var(--warm)" : "var(--line)"}`,
              transition: "border-color .15s",
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3, opacity: splitterHover ? 1 : 0.35, transition: "opacity .15s" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 10, height: 2.5, borderRadius: 2, background: splitterHover ? "var(--warm)" : "var(--faint)", transition: "background .15s" }} />
              ))}
            </div>
          </div>
        )}
        {panelOpen ? (
          <div className="stack" style={{ width: panelWidth, flex: "0 0 auto", background: "var(--paper)", paddingRight: 18 }}>
            {panelCard ? (
              /* a tapped message/reflection, opened in place — step back to return to the feed */
              <Hub
                variant="docked"
                person={panelCard.person}
                tab={panelCard.tab}
                backLabel="Back"
                backChev
                onClose={() => setPanelCard(null)}
                onSend={(body) => replyTo(panelCard.person.id, body)}
              />
            ) : (
              <>
                {/* header */}
                <div className="row" style={{ padding: "16px 18px 12px", gap: 9 }}>
                  <Icon name="lock" size={17} c="var(--warm)" />
                  <span className="h-title" style={{ fontSize: 20, color: "var(--ink)", whiteSpace: "nowrap" }}>
                    Privately with you
                  </span>
                  <div style={{ flex: 1 }} />
                  <button
                    className="btn ghost icon sm"
                    title="Hide this panel"
                    onClick={() => setPanelOpen(false)}
                    style={{ borderColor: "var(--line)" }}
                  >
                    <Icon name="chev" size={15} c="var(--muted)" />
                  </button>
                </div>

                {/* legend */}
                <div className="row" style={{ padding: "0 18px 10px", gap: 16 }}>
                  <span className="row" style={{ gap: 6, fontSize: 12, color: "var(--warm-ink)" }}>
                    <span className="dot warm" /> message
                  </span>
                  <span className="row" style={{ gap: 6, fontSize: 12, color: "var(--sky-ink)" }}>
                    <span className="dot sky" /> reflection
                  </span>
                </div>
                <DashRule />

                {/* one feed */}
                <div className="scroll" style={{ flex: 1, padding: "14px 16px 16px" }}>
                  {feed.length === 0 ? (
                    <span style={{ fontSize: 13.5, color: "var(--faint)" }}>Nothing private yet.</span>
                  ) : (
                    <div className="stack" style={{ gap: 9 }}>
                      {feed.map((item, i) => (
                        <PrivateFeedItem key={`${item.kind}-${item.id}-${i}`} item={item} onOpen={() => openItemInPanel(item)} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="stack"
            onClick={() => setPanelOpen(true)}
            title="Show the private panel"
            style={{
              width: 56,
              flex: "0 0 auto",
              borderLeft: "2px dashed var(--line)",
              background: "var(--card)",
              alignItems: "center",
              padding: "18px 0",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <button
                className="btn ghost icon sm"
                title="Show the private panel"
                onClick={() => setPanelOpen(true)}
                style={{ borderColor: "var(--line)" }}
              >
            <Icon name="chev" size={16} c="var(--muted)" style={{ transform: "rotate(180deg)" }} />
            </button>
            <Icon name="lock" size={18} c="var(--warm)" />
            <span className="h-title" style={{ writingMode: "vertical-rl", fontSize: 20, color: "var(--muted)" }}>
              Privately with you
            </span>
          </div>
        )}
      </div>
      <DashRule />
      <div className="row" style={{ padding: "16px 30px", gap: 14 }}>
        <input
          className="field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendToGroup()}
          placeholder={`Share something with the ${groupName}…`}
        />
        <button className="btn warm lg" onClick={sendToGroup} disabled={!draft.trim()}>
          <Icon name="send" size={18} c="#fff" /> Send
        </button>
      </div>

      {modal && (
        <Overlay onClose={() => setModal(null)}>
          {modal.type === "card" && (
            <Hub
              variant="card"
              person={modal.person}
              tab={modal.tab}
              onClose={() => setModal(null)}
              onSend={(body) => replyTo(modal.person.id, body)}
            />
          )}
          {modal.type === "end" && (
            <ConfirmPopup
              icon="x"
              accent="var(--red)"
              title="End tonight’s session?"
              body="Everyone is told the group is closing for tonight and gently returned home. Private messages from this session won’t carry over."
              confirm="End session"
              cancel="Stay a little longer"
              onClose={() => setModal(null)}
              onConfirm={async () => {
                // Closing the session removes everyone still in the room.
                await endSession(apiUrl, groupId).catch(() => {});
                router.push("/facilitator");
              }}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}
