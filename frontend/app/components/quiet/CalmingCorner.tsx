import { useState } from "react";

import { BreathePanel } from "./BreathePanel";
import { MeditationPanel } from "./MeditationPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import { SteadyMePanel } from "./SteadyMePanel";

type CalmingView = "breathe" | "steady" | "meditation" | "resources";

const calmingViews: Array<{ id: CalmingView; label: string }> = [
  { id: "breathe", label: "Breathe" },
  { id: "steady", label: "Steady me" },
  { id: "meditation", label: "Meditation" },
  { id: "resources", label: "Resources" },
];

export function CalmingCorner({ apiUrl }: { apiUrl: string }) {
  const [activeView, setActiveView] = useState<CalmingView>("breathe");

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Calming corner"
        className="flex flex-wrap gap-2"
      >
        {calmingViews.map((view) => {
          const isActive = view.id === activeView;

          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveView(view.id)}
              className={`btn sm ${isActive ? "calm" : "ghost"}`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {activeView === "breathe" ? (
        <BreathePanel />
      ) : activeView === "steady" ? (
        <SteadyMePanel />
      ) : activeView === "meditation" ? (
        <MeditationPanel apiUrl={apiUrl} />
      ) : (
        <ResourcesPanel apiUrl={apiUrl} />
      )}
    </div>
  );
}