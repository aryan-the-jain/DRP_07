"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { AvatarCircle, BrandMark, LineIcon } from "./DesignPrimitives";
import {
  fallbackApiUrl,
  fetchGroup,
  fetchParticipants,
} from "../lib/api";
import { NavGroup, SIDEBAR_GROUPS } from "../lib/nav";

// A reusable shell: the collapsible "alongside" sidebar plus a content area.
// Both the dashboard and the quiet groups render their screens as children, so
// the sidebar lives in one place rather than being duplicated per page. The nav
// entries are centralised in app/lib/nav.ts.

// --- Persistence keys & breakpoint -----------------------------------------

const STORAGE_KEY = "sidebar.collapsed";
const MOBILE_BREAKPOINT = 768;

// Home sits above the "Quiet room" header; the rest collapse under it.
const HOME_ITEM = SIDEBAR_GROUPS[0];
const QUIET_GROUPS = SIDEBAR_GROUPS.slice(1);

// --- A single sidebar nav link (module-level so it isn't recreated per render).

function SidebarNavLink({
  item,
  collapsed,
  pathname,
}: {
  item: NavGroup;
  collapsed: boolean;
  pathname: string;
}) {
  const base = item.match ?? item.href;
  const active = pathname === base || pathname.startsWith(`${base}/`);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      data-metric-id={item.metricId}
      className={`nav-link ${item.tone === "calm" ? "calm" : ""} ${
        active ? "active" : ""
      } ${collapsed ? "justify-center" : ""}`}
    >
      <LineIcon name={item.icon} size={22} className="shrink-0" />
      {!collapsed && (
        <span className="flex min-w-0 flex-col">
          <span className="truncate leading-tight">{item.label}</span>
          {item.subtitle && (
            <span className="mt-0.5 truncate text-[11px] font-normal leading-tight opacity-70">
              {item.subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------

export function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [quietRoomOpen, setQuietRoomOpen] = useState(true);
  const [facilitatorName, setFacilitatorName] = useState<string | null>(null);

  // Restore saved preferences; default to collapsed on narrow screens.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsed(stored === "true");
      } else if (window.innerWidth < MOBILE_BREAKPOINT) {
        setCollapsed(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // The bottom dock needs the facilitator's real name; pull it from the same
  // group/participants data the dashboard uses (read-only, best-effort).
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      Promise.all([fetchGroup(apiUrl), fetchParticipants(apiUrl)])
        .then(([group, participants]) => {
          if (!active) return;
          const facilitator = participants.find(
            (p) => p.role === "facilitator",
          );
          setFacilitatorName(
            facilitator?.displayName ?? group?.facilitatorName ?? null,
          );
        })
        .catch(() => {
          /* leave the fallback label */
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const facilitatorActive = pathname.startsWith("/message-facilitator");
  const dockLabel = facilitatorName
    ? `Message ${facilitatorName.split(" ")[0]}`
    : "Message the facilitator";
  const dockAvatar = facilitatorName ? (
    <AvatarCircle
      initials={facilitatorName.charAt(0).toUpperCase()}
      tone="calm"
      sizeClass="h-9 w-9 text-xs"
    />
  ) : (
    <span className="av calm h-9 w-9">
      <LineIcon name="mail" size={18} />
    </span>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <aside
        className={`relative flex shrink-0 flex-col bg-paper transition-[width] duration-300 ease-out ${
          collapsed ? "w-[78px]" : "w-60"
        }`}
      >
        {/* dotted divider on the right edge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 border-r-2 border-dashed border-line"
        />

        {/* collapse / expand toggle, floating on the divider */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 grid h-6 w-6 place-items-center rounded-full border border-line bg-card text-muted shadow-[0_2px_6px_rgba(68,52,35,0.12)] transition hover:text-ink"
        >
          <LineIcon
            name="arrowLeft"
            size={14}
            style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
          />
        </button>

        {/* logo */}
        <div
          className={`flex h-[72px] shrink-0 items-center ${
            collapsed ? "justify-center" : "px-5"
          }`}
        >
          <BrandMark markOnly={collapsed} />
        </div>

        <nav
          aria-label="Primary"
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto py-2 px-3"
        >
          <SidebarNavLink
            item={HOME_ITEM}
            collapsed={collapsed}
            pathname={pathname}
          />

          {collapsed ? (
            // Rail mode: no header, just the quiet-room icons.
            QUIET_GROUPS.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))
          ) : (
            <>
              <button
                type="button"
                onClick={() => setQuietRoomOpen((open) => !open)}
                aria-expanded={quietRoomOpen}
                className="leader mt-2 flex items-center justify-between gap-2 px-3.5 pb-1 pt-1 transition hover:text-ink"
              >
                <span>Quiet room</span>
                <LineIcon
                  name="arrowLeft"
                  size={13}
                  style={{
                    transform: quietRoomOpen
                      ? "rotate(90deg)"
                      : "rotate(-90deg)",
                  }}
                />
              </button>

              {quietRoomOpen &&
                QUIET_GROUPS.map((item) => (
                  <SidebarNavLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ))}
            </>
          )}
        </nav>

        {/* facilitator dock — pinned to the bottom, behind a dashed divider */}
        <div className="mt-auto px-3 pb-4 pt-3">
          <span
            aria-hidden="true"
            className="mb-3 block border-t-2 border-dashed border-line"
          />

          {collapsed ? (
            <Link
              href="/message-facilitator"
              data-metric-id="message-facilitator"
              aria-current={facilitatorActive ? "page" : undefined}
              title={dockLabel}
              className={`flex justify-center rounded-2xl border-2 p-1.5 transition ${
                facilitatorActive
                  ? "[border-color:var(--calm)] bg-calm-soft"
                  : "border-transparent hover:[border-color:var(--calm)]"
              }`}
            >
              {dockAvatar}
            </Link>
          ) : (
            <Link
              href="/message-facilitator"
              data-metric-id="message-facilitator"
              aria-current={facilitatorActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-2xl border-2 px-2.5 py-2 transition ${
                facilitatorActive
                  ? "[border-color:var(--calm)] bg-calm-soft"
                  : "border-line bg-card hover:[border-color:var(--calm)]"
              }`}
            >
              {dockAvatar}
              <span className="flex min-w-0 flex-col">
                <span
                  className={`text-[13.5px] font-semibold leading-tight text-ink ${
                    facilitatorName ? "truncate" : ""
                  }`}
                >
                  {dockLabel}
                </span>
                {facilitatorName && (
                  <span className="truncate text-[11px] text-muted">
                    your facilitator
                  </span>
                )}
              </span>
              {/* Only when we have a name — otherwise the avatar is already a
                  mail icon and a second one reads as a duplicate. */}
              {facilitatorName && (
                <LineIcon
                  name="mail"
                  size={18}
                  className="ml-auto shrink-0 [color:var(--calm)]"
                />
              )}
            </Link>
          )}
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
