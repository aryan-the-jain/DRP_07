"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AvatarCircle, BrandMark, LineIcon, IconName } from "./DesignPrimitives";
import { fallbackApiUrl, fetchParticipantInfo, getParticipantId } from "../lib/api";
import { Participant } from "../lib/types";

type SidebarProps = {
  activeTab: "home" | "circles" | "invitations" | "quiet";
};

export function Sidebar({ activeTab }: SidebarProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [showSoonToast, setShowSoonToast] = useState(false);
  const [soonText, setSoonText] = useState("");

  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  useEffect(() => {
    const id = getParticipantId();
    if (id) {
      fetchParticipantInfo(apiUrl, id)
        .then((user) => {
          if (user) setCurrentUser(user);
        })
        .catch(() => {});
    }
  }, [apiUrl]);

  function handleLogout() {
    localStorage.removeItem("current_participant_id");
    router.push("/login");
  }

  function handleNav(tab: string, path: string, isImplemented: boolean) {
    if (!isImplemented) {
      setSoonText(`The ${tab} area is being prepared for you. Take your time.`);
      setShowSoonToast(true);
      setTimeout(() => setShowSoonToast(false), 3000);
      return;
    }
    router.push(path);
  }

  const navItems = [
    { name: "Home", icon: "home" as IconName, path: "/dashboard", active: activeTab === "home", impl: true },
    { name: "My circles", icon: "people" as IconName, path: "/circles", active: activeTab === "circles", impl: false },
    { name: "Invitations", icon: "mail" as IconName, path: "/invitations", active: activeTab === "invitations", impl: false },
    { name: "Quiet space", icon: "quiet" as IconName, path: "/quiet", active: activeTab === "quiet", impl: true },
  ];

  return (
    <aside className="w-64 border-r-2 border-dashed border-line bg-card flex flex-col justify-between p-6 shrink-0 h-full relative">
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        <div className="px-2">
          <BrandMark />
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleNav(item.name, item.path, item.impl)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-all duration-150 cursor-pointer ${
                item.active
                  ? "bg-warm-soft text-warm-ink border border-warm/25 shadow-sm"
                  : "text-muted hover:text-ink hover:bg-paper/50"
              }`}
            >
              <LineIcon
                name={item.icon}
                size={18}
                className={item.active ? "[color:var(--warm)]" : "text-faint"}
              />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-line pt-5">
        {currentUser && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex items-center gap-3 text-left group min-w-0 flex-1 rounded-lg hover:bg-paper/30 p-1.5 transition-colors cursor-pointer"
              aria-label="Edit your profile"
            >
              <AvatarCircle
                initials={currentUser.initials}
                tone="warm"
                sizeClass="h-10 w-10 text-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink truncate group-hover:text-warm-ink transition-colors">
                  {currentUser.displayName}
                </span>
                <span className="block text-[11px] text-muted truncate">
                  {currentUser.pronouns || "Add pronouns"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-muted hover:text-warm-ink hover:bg-paper/50 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Coming Soon Toast Overlay */}
      {showSoonToast && (
        <div className="absolute bottom-20 left-6 right-6 sk thin soft bg-paper p-3 text-center text-xs leading-relaxed text-ink animate-fadeIn z-50 shadow-md">
          {soonText}
        </div>
      )}
    </aside>
  );
}
