"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { BrandMark, IconName, LineIcon } from "../../components/DesignPrimitives";

// The facilitator-side shell. It mirrors the participant SidebarLayout style
// (collapsible "alongside" rail + content area) but with the facilitator's own
// two destinations: Home and Arrivals.

const STORAGE_KEY = "fac.sidebar.collapsed";
const MOBILE_BREAKPOINT = 768;

type FacNavItem = { href: string; label: string; icon: IconName };

const NAV: FacNavItem[] = [
  { href: "/facilitator", label: "My groups", icon: "home" },
  { href: "/facilitator/arrivals", label: "Arrivals", icon: "people" },
];

// Arrivals owns the /facilitator/arrivals subtree; Home owns everything else
// under /facilitator (home, groups, room, …) so it stays lit on those pages.
function isActive(pathname: string, href: string): boolean {
  if (href === "/facilitator/arrivals") {
    return pathname.startsWith("/facilitator/arrivals");
  }
  return (
    pathname === "/facilitator" ||
    (pathname.startsWith("/facilitator/") &&
      !pathname.startsWith("/facilitator/arrivals"))
  );
}

export function FacilitatorSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Restore saved preference; default to collapsed on narrow screens.
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
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`nav-link ${active ? "active" : ""} ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <LineIcon name={item.icon} size={22} className="shrink-0" />
                {!collapsed && <span className="leading-tight">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Facilitator pages were built to scroll the window (their .stack root
          grows; .scroll has no min-height:0), so this pane owns the scroll. */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
