"use client";

import { useMemo } from "react";
import { useVisaFormStore } from "@/store/useVisaFormStore";
import type { WizardSection } from "./wizard-types";

interface Props {
  sections: WizardSection[];
}

export function WizardStepper({ sections }: Props) {
  const currentStep = useVisaFormStore((s) => s.currentStep);
  const completedSteps = useVisaFormStore((s) => s.completedSteps);
  const goToStep = useVisaFormStore((s) => s.goToStep);

  const completedSet = useMemo(() => new Set(completedSteps), [completedSteps]);
  const total = sections.length + 3; // sections + supplier + review + payment
  const percent = Math.round(((currentStep + 1) / total) * 100);

  const stepLabel =
    currentStep < sections.length
      ? `${currentStep + 1}/${total}: ${sections[currentStep]?.title}`
      : currentStep === sections.length
        ? `${currentStep + 1}/${total}: Choose Provider`
        : currentStep === sections.length + 1
          ? `${currentStep + 1}/${total}: Review & Submit`
          : `${currentStep + 1}/${total}: Payment`;

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{stepLabel}</span>
          <span className="text-xs text-gray-400">{percent}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-1 flex-wrap">
        {sections.map((s, i) => {
          const done = completedSet.has(i);
          const active = currentStep === i;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => done && goToStep(i)}
              disabled={!done && !active}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white"
                  : done
                    ? "bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
                    : "bg-white/5 text-gray-600 cursor-default"
              }`}
            >
              {done && !active && <span className="text-green-400">✓</span>}
              {s.title}
            </button>
          );
        })}

        {/* Fixed special steps */}
        {(["Choose Provider", "Review & Submit", "Payment"] as const).map(
          (label, offset) => {
            const stepIdx = sections.length + offset;
            const active = currentStep === stepIdx;
            return (
              <button
                key={label}
                type="button"
                disabled
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-white/5 text-gray-600 cursor-default"
                }`}
              >
                {label}
              </button>
            );
          },
        )}
      </div>

      {/* Global progress bar */}
      <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
