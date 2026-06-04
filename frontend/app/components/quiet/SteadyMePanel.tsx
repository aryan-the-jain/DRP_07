import { useState } from "react";

import { LineIcon } from "../DesignPrimitives";

const groundingSteps: Array<{ count: string; prompt: string; hint: string }> = [
  {
    count: "5",
    prompt: "things you can see",
    hint: "Look slowly around you and name five of them.",
  },
  {
    count: "4",
    prompt: "things you can touch",
    hint: "Notice what your hands or feet can feel right now.",
  },
  {
    count: "3",
    prompt: "things you can hear",
    hint: "Let the sounds nearby come to you.",
  },
  {
    count: "2",
    prompt: "things you can smell",
    hint: "Take a gentle breath in.",
  },
  {
    count: "1",
    prompt: "good thing about right now",
    hint: "However small, it counts.",
  },
];

export function SteadyMePanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const isFinal = stepIndex >= groundingSteps.length;

  return (
    <div className="sk soft bg-card p-6">
      <div
        className="flex items-center justify-center gap-2"
        aria-hidden="true"
      >
        {groundingSteps.map((_, index) => {
          const tone =
            index < stepIndex
              ? "bg-[var(--calm)]"
              : index === stepIndex && !isFinal
                ? "bg-[var(--warm)]"
                : "bg-[var(--line)]";

          return (
            <span key={index} className={`h-2.5 w-2.5 rounded-full ${tone}`} />
          );
        })}
      </div>

      {isFinal ? (
        <div className="mt-7 text-center">
          <h3 className="h-title text-2xl text-calm-ink">
            You&apos;re here. Well done for taking this moment.
          </h3>
          <button
            type="button"
            onClick={() => setStepIndex(0)}
            className="btn sm mt-5"
          >
            Start again
          </button>
        </div>
      ) : (
        <div className="mt-7 text-center">
          <p className="scrawl text-5xl text-calm-ink">
            {groundingSteps[stepIndex].count}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            {groundingSteps[stepIndex].prompt}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {groundingSteps[stepIndex].hint}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={stepIndex === 0}
              className="btn ghost sm inline-flex items-center gap-2"
            >
              <LineIcon name="arrowLeft" size={15} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((index) => index + 1)}
              className="btn calm sm"
            >
              {stepIndex === groundingSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}