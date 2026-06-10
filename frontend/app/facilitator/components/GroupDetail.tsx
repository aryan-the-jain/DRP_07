"use client";

// fac view — full-window group detail page (two-column: members + private notes) and
// the per-group notes popup (opened from the home card's note icon).

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, DashRule, Icon, Logo, SoftLabel } from "./Primitives";
import { CircleBadge, CloseBtn, ConfirmPopup, LostChip, Overlay } from "./Overlays";
import { Hub } from "./Hub";
import { InvitePanel } from "./Invite";
import {
  dmsFrom,
  groupCardFrom,
  lostLabel,
  personFromParticipant,
  sharedReflections,
  type GroupCard,
  type Person,
} from "../lib/data";
import {
  apiBase,
  deleteGroup,
  facilitatorId,
  fetchGroupNotes,
  fetchGroups,
  fetchInbox,
  fetchParticipant,
  fetchPrivateThread,
  updateGroupNotes,
  type GroupNotesResponse,
} from "../lib/api";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "60vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

// ====================================================================== NOTES EDITOR
// Self-contained read/edit component for a group's private notes.
// Read mode: shows notes in handwriting font (or dashed empty state) + Edit/Write button.
// Edit mode: textarea + Save / Cancel buttons.

function NotesEditor({
  groupId,
  minHeight = 220,
  autoEdit = false,
}: {
  groupId: number;
  minHeight?: number;
  autoEdit?: boolean;
}) {
  const apiUrl = apiBase();
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    fetchGroupNotes(apiUrl, groupId)
      .then((res) => {
        if (!active) return;
        setNotes(res.notes);
        setLoaded(true);
        if (autoEdit && !res.notes.trim()) {
          setDraft("");
          setEditing(true);
        }
      })
      .catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [apiUrl, groupId, autoEdit]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const v = el.value;
      el.value = "";
      el.value = v;
    }
  }, [editing]);

  const start = () => { setDraft(notes); setEditing(true); };
  const cancel = () => { setDraft(notes); setEditing(false); };

  const commit = async () => {
    setSaving(true);
    try {
      const res: GroupNotesResponse = await updateGroupNotes(apiUrl, groupId, draft);
      setNotes(res.notes);
      setEditing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    } catch {
      /* ignore — user can retry */
    } finally {
      setSaving(false);
    }
  };

  const has = !!notes.trim();

  if (!loaded) {
    return <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</span>;
  }

  if (editing) {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <textarea
          ref={textareaRef}
          className="field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What do you want to remember about this circle? Who to gently check in with, what landed, what to try next time…"
          style={{
            width: "100%",
            minHeight,
            resize: "vertical",
            fontFamily: "var(--hand)",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--ink)",
            display: "block",
          }}
        />
        <div className="row" style={{ gap: 10 }}>
          <button className="btn warm sm" onClick={commit} disabled={saving}>
            <Icon name="check" size={15} c="#fff" /> Save notes
          </button>
          {has && (
            <button className="btn ghost sm" onClick={cancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 13 }}>
      {has ? (
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--scrawl)", fontSize: 19, lineHeight: 1.55, color: "var(--ink)" }}>
          {notes}
        </div>
      ) : (
        <div
          className="sk thin soft"
          style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
        >
          Nothing jotted yet. After your next session, note who to check in with or what landed.
        </div>
      )}
      <div className="row" style={{ gap: 11 }}>
        <button className="btn ghost sm" onClick={start}>
          <Icon name="pen" size={15} c="var(--muted)" /> {has ? "Edit notes" : "Write a note"}
        </button>
        {flash && (
          <span className="row" style={{ gap: 6, fontSize: 14, color: "var(--calm-ink)" }}>
            <Icon name="check" size={14} c="var(--calm)" /> saved
          </span>
        )}
      </div>
    </div>
  );
}

// ====================================================================== GROUP NOTES POPUP
// Focused popup opened from the home card's note icon button.

export function GroupNotesPopup({
  groupId,
  groupName,
  onClose,
}: {
  groupId: number;
  groupName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="sk"
      style={{
        width: 540,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "18px 22px 14px", gap: 13, alignItems: "flex-start" }}>
        <div className="av" style={{ width: 44, height: 44, background: "var(--calm-soft)", borderColor: "var(--calm)" }}>
          <Icon name="note" size={22} c="var(--calm-ink)" />
        </div>
        <div className="stack" style={{ gap: 2, flex: 1, paddingTop: 1 }}>
          <span className="h-title" style={{ fontSize: 23, color: "var(--ink)" }}>
            Your notes · {groupName}
          </span>
          <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Icon name="lock" size={13} c="var(--calm)" /> private to you · never shared with the circle
          </span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ padding: "18px 22px 22px" }}>
        <NotesEditor groupId={groupId} minHeight={220} autoEdit />
      </div>
    </div>
  );
}

// ====================================================================== GROUP DETAIL PAGE

type DetailModal =
  | { type: "member"; person: Person }
  | { type: "invite" }
  | { type: "delete" }
  | null;

function DetailMemberRow({ p, onOpen }: { p: Person; onOpen: () => void }) {
  return (
    <div
      className="sk thin soft fac-tap"
      onClick={onOpen}
      style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
    >
      <Avatar name={p.name} size={42} tone={p.tone} />
      <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
        <span className="h-title" style={{ fontSize: 19, color: "var(--ink)" }}>{p.name}</span>
        <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
          {[p.pronouns, p.age].filter(Boolean).join(" · ") || "—"}
        </span>
      </div>
      <div className="row" style={{ gap: 8, flexShrink: 0 }}>
        <LostChip m={p} size={12.5} />
        {p.recency && (
          <span className="chip" style={{ fontSize: 12.5 }}>
            <Icon name="clock" size={12} c="var(--muted)" /> {p.recency.toLowerCase()}
          </span>
        )}
      </div>
      <Icon name="chev" size={16} c="var(--faint)" />
    </div>
  );
}

export function GroupDetailPage({ groupId }: { groupId: number }) {
  const router = useRouter();
  const apiUrl = apiBase();

  const [group, setGroup] = useState<GroupCard | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [modal, setModal] = useState<DetailModal>(null);
  const [deleting, setDeleting] = useState(false);
  const [tick, setTick] = useState(0);
  const close = () => setModal(null);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await fetchGroups(apiUrl);
        const found = gs.find((g) => g.groupId === groupId);
        if (!found) { if (active) setStatus("error"); return; }
        const card = groupCardFrom(found);
        if (!active) return;
        setGroup(card);

        const ps = await Promise.all(card.members.map((m) => fetchParticipant(apiUrl, m.id)));
        if (!active) return;
        setPeople(ps.map(personFromParticipant));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => { active = false; };
  }, [apiUrl, groupId, tick]);

  const openMember = async (id: number) => {
    if (!group) return;
    try {
      const [p, thread, inbox] = await Promise.all([
        fetchParticipant(apiUrl, id),
        fetchPrivateThread(apiUrl, groupId, id),
        fetchInbox(apiUrl, groupId),
      ]);
      const entry = inbox.find((e) => e.participant.id === id);
      setModal({
        type: "member",
        person: {
          ...personFromParticipant(p),
          dm: dmsFrom(thread, facilitatorId),
          reflections: entry ? sharedReflections(entry.sharedFacilitatorNote, entry.sharedFreeWriting) : [],
          unread: entry?.hasUnread ? 1 : 0,
        },
      });
    } catch {
      /* ignore */
    }
  };

  const confirmDelete = async () => {
    if (!group) return;
    setDeleting(true);
    try {
      await deleteGroup(apiUrl, groupId);
      router.push("/facilitator");
    } catch {
      setDeleting(false);
      close();
    }
  };

  const memberCount = people?.length ?? group?.members.length ?? 0;

  return (
    <div className="stack" style={{ minHeight: "100%", background: "var(--paper)", position: "relative" }}>
      {/* top bar */}
      <div className="row" style={{ padding: "15px 26px", gap: 10 }}>
        <button className="btn ghost sm" onClick={() => router.push("/facilitator")}>
          <Icon name="back" size={16} c="var(--muted)" /> Your groups
        </button>
        <div style={{ flex: 1 }} />
        {status === "ready" && (
          <>
            <button className="btn ghost sm" onClick={() => router.push(`/facilitator/groups/${groupId}/edit`)}>
              <Icon name="pen" size={15} c="var(--muted)" /> Edit details
            </button>
            <button className="btn warm sm" onClick={() => setModal({ type: "invite" })}>
              <Icon name="mail" size={15} c="#fff" /> Invite someone
            </button>
          </>
        )}
        <Logo size={24} />
      </div>
      <DashRule />

      <div className="scroll" style={{ flex: 1, padding: "26px 32px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {status === "loading" && <Centered>Loading…</Centered>}
          {status === "error" && <Centered>We couldn't find that group.</Centered>}

          {status === "ready" && group && (
            <>
              {/* title block */}
              <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div
                  className="av"
                  style={{ width: 48, height: 48, background: "var(--warm-soft)", borderColor: "var(--warm)", alignSelf: "center" }}
                >
                  <Icon name="people" size={24} c="var(--warm)" />
                </div>
                <h2 className="h-title" style={{ fontSize: 33, color: "var(--ink)" }}>{group.name}</h2>
                <CircleBadge c={group} />
              </div>

              {/* info chips */}
              <div className="row" style={{ gap: 9, marginTop: 16, flexWrap: "wrap" }}>
                <span className="chip">
                  <Icon name="cal" size={14} c="var(--muted)" /> {group.when}
                </span>
                {group.durationMinutes != null && (
                  <span className="chip">
                    <Icon name="clock" size={14} c="var(--muted)" /> {group.durationMinutes} min
                  </span>
                )}
                <span className="chip">
                  <Icon name="people" size={14} c="var(--muted)" /> {memberCount} {memberCount === 1 ? "person" : "people"}
                </span>
              </div>

              {/* description */}
              {group.description && (
                <p style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.55, margin: "16px 0 0", maxWidth: 720 }}>
                  {group.description}
                </p>
              )}

              {/* two-column: members left, notes right */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.55fr 1fr",
                  gap: 24,
                  marginTop: 26,
                  alignItems: "start",
                }}
              >
                {/* members column */}
                <div className="stack" style={{ gap: 12 }}>
                  <SoftLabel>
                    {people && people.length > 0
                      ? "Everyone in this circle · tap a name to read their profile"
                      : "Members"}
                  </SoftLabel>
                  {people === null ? (
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading members…</span>
                  ) : people.length === 0 ? (
                    <div
                      className="sk thin soft"
                      style={{ padding: "22px 18px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
                    >
                      No one has been placed in this group yet.
                    </div>
                  ) : (
                    <div className="stack" style={{ gap: 10 }}>
                      {people.map((p) => (
                        <DetailMemberRow key={p.id} p={p} onOpen={() => openMember(p.id)} />
                      ))}
                    </div>
                  )}
                </div>

                {/* notes column */}
                <div className="sk v2 soft" style={{ padding: "18px 20px", background: "var(--card)" }}>
                  <div className="row" style={{ gap: 9, marginBottom: 4 }}>
                    <Icon name="note" size={17} c="var(--calm)" />
                    <span className="h-title" style={{ fontSize: 21, color: "var(--ink)", flex: 1 }}>
                      Your private notes
                    </span>
                  </div>
                  <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                    <Icon name="lock" size={13} c="var(--calm)" /> kept to you · written after sessions
                  </span>
                  <NotesEditor groupId={groupId} minHeight={240} />
                </div>
              </div>

              {/* close circle section */}
              <div
                className="sk dash soft"
                style={{
                  marginTop: 30,
                  padding: "18px 20px",
                  background: "transparent",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div className="stack" style={{ gap: 3, flex: 1, minWidth: 240 }}>
                  <span className="h-title" style={{ fontSize: 20, color: "var(--ink)" }}>Close this circle</span>
                  <span style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.45 }}>
                    Everyone is gently let know and returned home. Nothing they've shared is deleted — the circle simply stops meeting.
                  </span>
                </div>
                <button
                  className="btn ghost sm"
                  onClick={() => setModal({ type: "delete" })}
                  style={{ borderColor: "color-mix(in oklch, var(--warm) 45%, var(--line))", color: "var(--warm-ink)" }}
                >
                  <Icon name="leaf" size={15} c="var(--warm)" /> Close circle
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modal && (
        <Overlay onClose={close}>
          {modal.type === "member" && (
            <Hub
              variant="card"
              person={modal.person}
              onClose={close}
              backLabel={group?.name ?? "Group"}
            />
          )}
          {modal.type === "invite" && group && (
            <InvitePanel group={group} onClose={close} onPlaced={() => { close(); reload(); }} />
          )}
          {modal.type === "delete" && group && (
            <ConfirmPopup
              icon="leaf"
              accent="var(--warm)"
              title={`Close ${group.name}?`}
              body="The circle closes and everyone in it is gently let know and returned home. Nothing they've shared is deleted — only the circle stops meeting."
              confirm={deleting ? "Closing…" : "Close circle"}
              cancel="Keep it"
              caption="this can't be undone — members see a soft goodbye, never a sudden cut-off"
              onClose={close}
              onConfirm={confirmDelete}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}
