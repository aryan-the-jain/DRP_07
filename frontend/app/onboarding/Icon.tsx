import type { CSSProperties, JSX } from "react";

// Minimal line-icon set ported from the design's wf-shared.jsx — only the icons
// the onboarding survey actually uses (check, chev, heart).
export type IconName = "check" | "chev" | "heart";

type IconProps = {
  name: IconName;
  size?: number;
  c?: string;
  sw?: number;
  style?: CSSProperties;
};

export function Icon({
  name,
  size = 20,
  c = "currentColor",
  sw = 1.8,
  style,
}: IconProps) {
  const p = {
    fill: "none",
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, JSX.Element> = {
    chev: <path {...p} d="M8 4l5 6-5 6" />,
    check: <path {...p} d="M4 11l5 5 9-11" />,
    heart: (
      <path
        {...p}
        d="M11 18S3.5 13 3.5 8.2A3.7 3.7 0 0 1 11 6a3.7 3.7 0 0 1 7.5 2.2C18.5 13 11 18 11 18Z"
      />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      style={{ display: "block", flex: "0 0 auto", ...style }}
    >
      {paths[name]}
    </svg>
  );
}
