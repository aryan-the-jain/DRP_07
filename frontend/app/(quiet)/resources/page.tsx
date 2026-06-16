"use client";

import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";
import { ResourcesPanel } from "../../components/quiet/ResourcesPanel";
import { useQuietSpaceContext } from "../../lib/QuietSpaceContext";

export default function ResourcesPage() {
  const { apiUrl } = useQuietSpaceContext();

  return (
    <QuietSpaceFrame
      heading="Resources"
      // TODO: same as before, is this actually shared by the facilitator?
      description="Helpful links shared by your facilitator - take a look whenever you're ready."
    >
      <ResourcesPanel apiUrl={apiUrl} />
    </QuietSpaceFrame>
  );
}
