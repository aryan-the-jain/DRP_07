"use client";

import { MeditationPanel } from "../../components/quiet/MeditationPanel";
import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";
import { useQuietSpaceContext } from "../../lib/QuietSpaceContext";

export default function MeditationPage() {
  const { apiUrl } = useQuietSpaceContext();

  return (
    <QuietSpaceFrame
      heading="Meditation"
      description="A few gentle playlists to rest with, chosen by your facilitator."
    >
      <MeditationPanel apiUrl={apiUrl} />
    </QuietSpaceFrame>
  );
}
