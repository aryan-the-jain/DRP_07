"use client";

import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";
import { SteadyMePanel } from "../../components/quiet/SteadyMePanel";

export default function SteadyPage() {
  return (
    <QuietSpaceFrame
      heading="Reset Focus"
      description="A gentle 5-4-3-2-1 grounding exercise to bring you back to the here and now."
    >
      <SteadyMePanel />
    </QuietSpaceFrame>
  );
}
