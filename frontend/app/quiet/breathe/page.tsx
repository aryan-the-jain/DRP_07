"use client";

import { BreathePanel } from "../../components/quiet/BreathePanel";
import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";

export default function BreathePage() {
  return (
    <QuietSpaceFrame
      heading="Breathe"
      description="Follow the circle if it helps. There's no rush — let your breath find its own pace."
    >
      <BreathePanel />
    </QuietSpaceFrame>
  );
}
