"use client";

import { GroupTabs } from "../../../components/quiet/GroupTabs";
import { MeditationPanel } from "../../../components/quiet/MeditationPanel";
import { QuietSpaceFrame } from "../../../components/quiet/QuietSpaceFrame";
import { CALM_TABS } from "../../../lib/nav";
import { useQuietSpaceContext } from "../../../lib/QuietSpaceContext";

export default function MeditationPage() {
  const { apiUrl } = useQuietSpaceContext();

  return (
    <QuietSpaceFrame
      heading="Meditation"
      description="A few gentle playlists to rest with, chosen by your facilitator."
    >
      <GroupTabs tabs={CALM_TABS} ariaLabel="Feel calm" />

      <MeditationPanel apiUrl={apiUrl} />
    </QuietSpaceFrame>
  );
}
