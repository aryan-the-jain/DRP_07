"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { BrandMark, IconName, LineIcon } from "./DesignPrimitives";

// A reusable shell: the collapsible "alongside" sidebar plus a content area.
// Both the dashboard and the quiet space render their screens as children, so
// the sidebar lives in one place rather than being duplicated per page.

// --- Nav items ---------------------------------------------------

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  tone?: "calm";
  metricId?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/quiet/breathe", label: "Breathe", icon: "wind", tone: "calm" },
  {
    href: "/quiet/steady",
    label: "Reset Focus",
    icon: "quiet",
    tone: "calm",
    metricId: "calm-steady",
  },
  {
    href: "/quiet/meditation",
    label: "Meditation",
    icon: "spotify",
    tone: "calm",
  },
  {
    href: "/quiet/doodle",
    label: "Doodle",
    icon: "brush",
    tone: "calm",
    metricId: "calm-doodle",
  },
  {
    href: "/quiet/resources",
    label: "Resources",
    icon: "externalLink",
    tone: "calm",
  },
  {
    href: "/quiet/guided",
    label: "Guided questions",
    icon: "heart",
    tone: "calm",
  },
  {
    href: "/quiet/free",
    label: "Free writing",
    icon: "pen",
    tone: "calm",
    metricId: "reflect-free",
  },
  {
    href: "/quiet/facilitator",
    label: "Message facilitator",
    icon: "mail",
    tone: "calm",
    metricId: "message-facilitator",
  },
];

// --- Persistence keys & breakpoint -----------------------------------------

const STORAGE_KEY = "sidebar.collapsed";
const MOBILE_BREAKPOINT = 768;

// ---------------------------------------------------------------------------

export function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                data-metric-id={item.metricId}
                className={`nav-link ${item.tone === "calm" ? "calm" : ""} ${
                  active ? "active" : ""
                } ${collapsed ? "justify-center" : ""}`}
              >
                <LineIcon name={item.icon} size={22} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* faint dotted rule near the bottom */}
        <div className="px-4 pb-5">
          <span
            aria-hidden="true"
            className="block border-t-2 border-dashed border-line"
          />
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
