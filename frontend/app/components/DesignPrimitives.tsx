import { CSSProperties, ReactNode } from "react";

export type IconName =
  | "arrowLeft"
  | "check"
  | "clock"
  | "close"
  | "externalLink"
  | "heart"
  | "mail"
  | "people"
  | "pen"
  | "quiet"
  | "send"
  | "spotify"
  | "wind";

type LineIconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function LineIcon({
  name,
  size = 20,
  className,
  style,
}: LineIconProps) {
  const pathProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  const paths: Record<IconName, ReactNode> = {
    arrowLeft: <path {...pathProps} d="M13 5 7 11l6 6M7 11h11" />,
    check: <path {...pathProps} d="M4 11l5 5 9-11" />,
    clock: (
      <>
        <circle {...pathProps} cx="11" cy="11" r="8" />
        <path {...pathProps} d="M11 6.5V11l3 2" />
      </>
    ),
    close: <path {...pathProps} d="M5 5l12 12M17 5 5 17" />,
    externalLink: (
      <>
        <path
          {...pathProps}
          d="M16 12.5V17a1.8 1.8 0 0 1-1.8 1.8H5A1.8 1.8 0 0 1 3.2 17V7.8A1.8 1.8 0 0 1 5 6h4.5"
        />
        <path {...pathProps} d="M12.5 4H18v5.5M18 4l-7.5 7.5" />
      </>
    ),
    heart: (
      <path
        {...pathProps}
        d="M11 18S3.5 13 3.5 8.2A3.7 3.7 0 0 1 11 6a3.7 3.7 0 0 1 7.5 2.2C18.5 13 11 18 11 18Z"
      />
    ),
    mail: (
      <>
        <rect {...pathProps} x="3" y="5" width="16" height="12" rx="2.5" />
        <path {...pathProps} d="M4 7l7 5 7-5" />
      </>
    ),
    people: (
      <>
        <circle {...pathProps} cx="8" cy="8" r="3" />
        <path {...pathProps} d="M2.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path {...pathProps} d="M15 6.2a3 3 0 0 1 0 5.6M16 13.5c2.4.5 4 2.4 4 4.5" />
      </>
    ),
    pen: <path {...pathProps} d="M4 18l1-3.5L14 5.5l3 3L8 17.5 4 18ZM12 7.5l3 3" />,
    quiet: (
      <>
        <circle {...pathProps} cx="11" cy="11" r="3" />
        <circle {...pathProps} cx="11" cy="11" r="6.5" opacity="0.55" />
        <circle {...pathProps} cx="11" cy="11" r="9.5" opacity="0.28" />
      </>
    ),
    send: <path {...pathProps} d="M4 11 18 4l-5 14-2.5-5.5L4 11Zm6.5 1.5L18 4" />,
    spotify: (
      <>
        <path {...pathProps} d="M5 8.5c4-1.1 8.2-0.6 11.8 1.6" />
        <path {...pathProps} d="M5.6 12c3.2-0.8 6.7-0.4 9.6 1.4" />
        <path {...pathProps} d="M6.4 15.2c2.4-0.6 5-0.3 7.1 1.1" />
      </>
    ),
    wind: (
      <>
        <path {...pathProps} d="M3 8h9a2.4 2.4 0 1 0-2.4-2.4" />
        <path {...pathProps} d="M3 12h13a2.4 2.4 0 1 1-2.4 2.4" />
        <path {...pathProps} d="M3 16h6.5a2.1 2.1 0 1 1-2.1 2.1" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 22 22"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

export function BrandMark({ small = false }: { small?: boolean }) {
  const ring = small ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className="flex items-center gap-2.5">
      <span className={`relative ${ring} shrink-0 rounded-full border-2 border-[var(--ink)]`}>
        <span className="absolute inset-1 rounded-full border border-[var(--warm)]" />
        <span className="absolute inset-[9px] rounded-full bg-[var(--warm)]" />
      </span>
      <span className={`h-title text-[var(--ink)] ${small ? "text-xl" : "text-2xl"}`}>
        alongside
      </span>
    </div>
  );
}

export function AvatarCircle({
  initials,
  tone = "warm",
  sizeClass = "h-10 w-10 text-sm",
  className = "",
}: {
  initials: string;
  tone?: "warm" | "calm" | "muted";
  sizeClass?: string;
  className?: string;
}) {
  const toneClass = tone === "calm" ? "calm" : tone === "muted" ? "muted" : "";

  return (
    <span className={`av ${toneClass} ${sizeClass} ${className}`}>
      {initials}
    </span>
  );
}
