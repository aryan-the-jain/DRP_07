import { IconName } from "../components/DesignPrimitives";

// Centralised navigation config for the quiet-space experience.
//
// SIDEBAR_GROUPS drives the left sidebar (one entry per group). Each group's
// default href points at its first sub-tab so clicking the group lands there.
// The *_TABS arrays drive the horizontal sub-tab pill row at the top of each
// group's content area (Draw and Resources are single views, so they have none).

export type NavGroup = {
  href: string; // where the sidebar links (the group's default sub-tab)
  label: string;
  subtitle?: string;
  icon: IconName;
  tone?: "calm";
  // Path prefix used to mark the group active (defaults to href).
  match?: string;
  // UX-metrics target id, kept on the relevant nav element.
  metricId?: string;
};

export const SIDEBAR_GROUPS: NavGroup[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  {
    href: "/write/free",
    label: "Write",
    subtitle: "freely or with gentle prompts",
    icon: "pen",
    tone: "calm",
    match: "/write",
  },
  {
    href: "/calm/breathe",
    label: "Feel calm",
    subtitle: "breathe, observe & meditate",
    icon: "wind",
    tone: "calm",
    match: "/calm",
  },
  {
    href: "/draw",
    label: "Draw",
    subtitle: "a little space to doodle",
    icon: "brush",
    tone: "calm",
    match: "/draw",
    metricId: "calm-doodle",
  },
  {
    href: "/resources",
    label: "Resources",
    subtitle: "support links to keep",
    icon: "externalLink",
    tone: "calm",
    match: "/resources",
  },
];

export type SubTab = {
  href: string;
  label: string;
  metricId?: string;
};

export const WRITE_TABS: SubTab[] = [
  { href: "/write/free", label: "Free writing", metricId: "reflect-free" },
  { href: "/write/guided", label: "Guided questions", metricId: "reflect-guided" },
];

export const CALM_TABS: SubTab[] = [
  { href: "/calm/breathe", label: "Slow Your Breathing", metricId: "calm-breathe" },
  {
    href: "/calm/steady",
    label: "Notice Things Around You",
    metricId: "calm-steady",
  },
  {
    href: "/calm/meditation",
    label: "Guided Meditation",
    metricId: "calm-meditation",
  },
];
