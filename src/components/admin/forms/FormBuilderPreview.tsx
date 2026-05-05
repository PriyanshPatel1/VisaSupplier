"use client";

import { useState } from "react";
import { WizardSectionForm } from "@/components/form/WizardSectionForm";
import { StepNav } from "@/components/form/ui/FormControls";
import type { WizardConfig } from "@/components/form/wizard-types";

interface Props {
  config: WizardConfig;
}

export function FormBuilderPreview({ config }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});

  if (config.sections.length === 0) return null;

  const previewStep = Math.min(currentStep, config.sections.length - 1);
  const section = config.sections[previewStep];
  const currentValues = values[section.id] ?? {};
  const isFirstStep = previewStep === 0;
  const isLastStep = previewStep === config.sections.length - 1;

  const setFieldValue = (fieldId: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [section.id]: {
        ...(prev[section.id] ?? {}),
        [fieldId]: value,
      },
    }));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
              Live Preview
            </p>
            <h3 className="mt-1 text-sm font-bold text-gray-900">{config.formLabel || "Untitled form"}</h3>
            <p className="mt-1 text-xs text-gray-500">
              Step through each section exactly as applicants will see it.
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Step</p>
            <p className="text-sm font-bold text-indigo-700">
              {previewStep + 1} / {config.sections.length}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {config.sections.map((previewSection, index) => {
            const active = index === previewStep;
            return (
              <button
                key={`${previewSection.id}-${index}`}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={[
                  "min-w-0 rounded-xl border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:text-indigo-600",
                ].join(" ")}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide">Step {index + 1}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">
                  {previewSection.icon} {previewSection.title || "Untitled"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-[#18223d] bg-[#0b0c14] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="mb-6 border-b border-white/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-400">
            Preview Step {previewStep + 1}
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">{section.title || "Untitled Section"}</h3>
          <p className="mt-1 text-sm text-gray-400">
            {section.description || "Add a section description to guide applicants through this step."}
          </p>
        </div>

        <WizardSectionForm
          section={section}
          values={currentValues}
          errors={{}}
          onChange={setFieldValue}
        />

        <StepNav
          onBack={isFirstStep ? undefined : () => setCurrentStep(previewStep - 1)}
          onNext={isLastStep ? undefined : () => setCurrentStep(previewStep + 1)}
          nextLabel={isLastStep ? "Preview Final Steps" : "Next Preview Step →"}
          backLabel="← Previous Step"
          nextDisabled={isLastStep}
        />

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            "After sections: supplier selection",
            "Then: review and submit",
            "Finally: payment",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
