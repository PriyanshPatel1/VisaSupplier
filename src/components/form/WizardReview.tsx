"use client";

import { useState } from "react";
import { useVisaFormStore } from "@/store/useVisaFormStore";
import type { WizardSection } from "./wizard-types";
import type { VisaType } from "@/types";

interface Props {
  sections: WizardSection[];
  visa: VisaType;
  supplierName?: string;
  visaFee: number;
  serviceFee: number;
  totalPaid: number;
  onBack: () => void;
  onSubmit: () => void;
}

export function WizardReview({
  sections,
  visa,
  supplierName,
  visaFee,
  serviceFee,
  totalPaid,
  onBack,
  onSubmit,
}: Props) {
  const allValues = useVisaFormStore((s) => s.allValues);
  const goToStep = useVisaFormStore((s) => s.goToStep);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!agreed) return;
    onSubmit(); // navigate to payment — no fake success here
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Review all sections. Click{" "}
        <span className="text-indigo-400 font-semibold">Edit</span> to go back and change anything.
      </p>

      {sections.map((section, i) => {
        const vals = allValues[section.id] ?? {};
        const filled = Object.entries(vals).filter(([, v]) => v && v.trim() !== "");
        return (
          <div key={section.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
              <div className="flex items-center gap-2">
                <span>{section.icon}</span>
                <p className="text-sm font-semibold text-white">{section.title}</p>
                {filled.length > 0 && (
                  <span className="text-xs text-green-400">
                    ✓ {filled.length} field{filled.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={() => goToStep(i)}
                className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
            {filled.length > 0 && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {filled.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-sm text-white font-medium truncate">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Fee Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Fee Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{visa.name} — Visa Fee</span>
            <span className="text-white font-medium">${visaFee}</span>
          </div>
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Service Fee{supplierName ? ` (${supplierName})` : ""}
              </span>
              <span className="text-white font-medium">+${serviceFee}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-sm font-bold text-white">Total Due</span>
            <span className="text-lg font-black text-indigo-400">${totalPaid}</span>
          </div>
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-4">
        <p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">Declaration</p>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          I certify that all answers are true and correct to the best of my knowledge. I understand
          that false information may result in visa denial or future inadmissibility.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-indigo-500 flex-shrink-0"
          />
          <span className={`text-sm ${agreed ? "text-white font-medium" : "text-gray-400"}`}>
            I agree to the above declaration and confirm all information is accurate.
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!agreed}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
