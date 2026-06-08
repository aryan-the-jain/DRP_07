"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { QuietReflectionRoom } from "../components/QuietReflectionRoom";
import { Sidebar } from "../components/Sidebar";
import { fallbackApiUrl } from "../lib/api";
import { useQuietSpace } from "../lib/useQuietSpace";

// Standalone quiet space, reachable from the dashboard. It reuses the exact same
// QuietReflectionRoom and reflection logic as the in-room quiet tab; only the
// framing and the "back" destination (the dashboard) differ.
export default function QuietPage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const quiet = useQuietSpace(apiUrl);

  useEffect(() => {
    const id = localStorage.getItem("current_participant_id");
    if (!id) {
      router.push("/login");
    }
  }, [router]);

  async function handleExit() {
    // Save any draft before leaving, then return where the visitor came from.
    // A `return` query param lets callers (e.g. onboarding) send the visitor
    // back to exactly where they left off; otherwise fall back to the dashboard.
    await quiet.persistDraftReflection();
    const returnTo = new URLSearchParams(window.location.search).get("return");
    const destination =
      returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";
    router.push(destination);
  }

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-paper text-ink">
      <Sidebar activeTab="quiet" />

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        <QuietReflectionRoom
          apiUrl={apiUrl}
          privateNote={quiet.privateNote}
          facilitatorNote={quiet.facilitatorNote}
          freeWritingNote={quiet.freeWritingNote}
          shareSelection={quiet.shareSelection}
          isSharingReflection={quiet.isSharingReflection}
          isReflectionShared={quiet.isReflectionShared}
          quietSpaceError={quiet.quietSpaceError}
          onPrivateNoteChange={quiet.handlePrivateNoteChange}
          onFacilitatorNoteChange={quiet.handleFacilitatorNoteChange}
          onFreeWritingNoteChange={quiet.handleFreeWritingNoteChange}
          onShareSelectionChange={quiet.handleShareSelectionChange}
          onExitQuietSpace={handleExit}
          onShareReflection={quiet.handleShareReflection}
          backLabel="Back to your space"
        />
      </div>
    </main>
  );
}
