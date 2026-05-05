/**
 * ─── Visa Application Wizard — Zustand Store ─────────────────────────────────
 *
 * Production-grade, fully dynamic store for multi-step visa application forms.
 * Works with any WizardConfig sections/fields fetched from the database.
 *
 * Features:
 *  • persist middleware  — auto-saves draft to localStorage per visaId
 *  • partialised storage — only form data is persisted, NOT transient UI state
 *  • version-stamped     — enables future schema migrations
 *  • selector hooks      — fine-grained subscriptions for render optimisation
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────

/** All form values keyed by sectionId → fieldId → value */
export type WizardValues = Record<string, Record<string, string>>;

/** Persisted subset written to localStorage */
interface PersistedSlice {
  visaId: string;
  allValues: WizardValues;
  completedSteps: number[];
  supplierId: string;
}

/** Full store state */
interface VisaFormState extends PersistedSlice {
  // ── Transient (NOT persisted) ───────────────────────────────────────────
  currentStep: number;
  totalSteps: number;
  errors: Record<string, string>;
  showResumeBanner: boolean;
  _hydrated: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Initialise or re-initialise the wizard for a given visa + section count */
  initWizard: (visaId: string, totalSections: number) => void;

  /** Set a single field value; auto-clears its validation error */
  setFieldValue: (sectionId: string, fieldId: string, value: string) => void;

  /** Bulk-set validation errors */
  setErrors: (errors: Record<string, string>) => void;

  /** Clear all validation errors */
  clearErrors: () => void;

  /** Set selected supplier */
  setSupplierId: (id: string) => void;

  /** Mark a step index as completed */
  markStepComplete: (step: number) => void;

  /** Navigate to a specific step (only if completed or current) */
  goToStep: (step: number) => void;

  /** Advance to next step, marking current as complete */
  goNext: () => void;

  /** Go back one step */
  goBack: () => void;

  /** Full reset — clears state and removes persisted draft */
  resetForm: () => void;

  /** Hide the "resuming saved session" banner */
  dismissResumeBanner: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "visahub_wizard_";

function storageKey(visaId: string) {
  return `${STORAGE_PREFIX}${visaId}`;
}

/** Empty defaults for initialisation / reset */
const INITIAL_TRANSIENT: Pick<
  VisaFormState,
  "currentStep" | "errors" | "showResumeBanner" | "_hydrated"
> = {
  currentStep: 0,
  errors: {},
  showResumeBanner: false,
  _hydrated: false,
};

const INITIAL_PERSISTED: PersistedSlice = {
  visaId: "",
  allValues: {},
  completedSteps: [],
  supplierId: "",
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useVisaFormStore = create<VisaFormState>()(
  persist(
    (set, get) => ({
      // ── Default state ─────────────────────────────────────────────────
      ...INITIAL_PERSISTED,
      ...INITIAL_TRANSIENT,
      totalSteps: 0,

      // ── Actions ───────────────────────────────────────────────────────

      initWizard: (visaId, totalSections) => {
        const state = get();
        // totalSteps = dynamic sections + supplier + review + payment
        const totalSteps = totalSections + 3;

        // If same visa, just update totalSteps (don't reset data)
        if (state.visaId === visaId && state._hydrated) {
          set({ totalSteps });
          return;
        }

        // Different visa or first load — try to hydrate from localStorage
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(storageKey(visaId));
            if (raw) {
              const parsed = JSON.parse(raw) as { state?: PersistedSlice };
              const persisted = parsed?.state;
              if (persisted && persisted.visaId === visaId) {
                const hasData = Object.keys(persisted.allValues ?? {}).length > 0;
                set({
                  visaId,
                  totalSteps,
                  allValues: persisted.allValues ?? {},
                  completedSteps: persisted.completedSteps ?? [],
                  supplierId: persisted.supplierId ?? "",
                  currentStep: 0,
                  errors: {},
                  showResumeBanner: hasData,
                  _hydrated: true,
                });

                // Auto-dismiss resume banner after 5s
                if (hasData) {
                  window.setTimeout(() => {
                    if (get().showResumeBanner) {
                      set({ showResumeBanner: false });
                    }
                  }, 5000);
                }
                return;
              }
            }
          } catch {
            // ignore corrupt data
          }
        }

        // Fresh start
        set({
          ...INITIAL_PERSISTED,
          ...INITIAL_TRANSIENT,
          visaId,
          totalSteps,
          _hydrated: true,
        });
      },

      setFieldValue: (sectionId, fieldId, value) => {
        set((state) => {
          const sectionValues = state.allValues[sectionId] ?? {};
          const newErrors = { ...state.errors };
          delete newErrors[fieldId];

          return {
            allValues: {
              ...state.allValues,
              [sectionId]: { ...sectionValues, [fieldId]: value },
            },
            errors: newErrors,
          };
        });
      },

      setErrors: (errors) => set({ errors }),

      clearErrors: () => set({ errors: {} }),

      setSupplierId: (id) => set({ supplierId: id }),

      markStepComplete: (step) => {
        set((state) => {
          const steps = new Set(state.completedSteps);
          steps.add(step);
          return { completedSteps: Array.from(steps) };
        });
      },

      goToStep: (step) => {
        const state = get();
        if (step < 0 || step >= state.totalSteps) return;
        const completed = new Set(state.completedSteps);
        // Allow navigation if: target is completed, is current, or previous step is completed
        if (
          completed.has(step) ||
          step === state.currentStep ||
          completed.has(step - 1)
        ) {
          set({ currentStep: step, errors: {} });
        }
      },

      goNext: () => {
        set((state) => {
          const steps = new Set(state.completedSteps);
          steps.add(state.currentStep);
          return {
            completedSteps: Array.from(steps),
            currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
            errors: {},
          };
        });
      },

      goBack: () => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
          errors: {},
        }));
      },

      resetForm: () => {
        const { visaId, totalSteps } = get();

        // Remove persisted draft
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(storageKey(visaId));
          } catch {
            // ignore
          }
        }

        set({
          ...INITIAL_PERSISTED,
          ...INITIAL_TRANSIENT,
          visaId,
          totalSteps,
          _hydrated: true,
        });
      },

      dismissResumeBanner: () => set({ showResumeBanner: false }),
    }),
    {
      name: "visahub_wizard", // base key (overridden dynamically)
      version: 1,
      storage: createJSONStorage(() => {
        // Custom storage that routes to the correct visaId-scoped key
        return {
          getItem: (name: string) => {
            if (typeof window === "undefined") return null;
            // We handle hydration manually in initWizard
            return localStorage.getItem(name);
          },
          setItem: (_name: string, value: string) => {
            if (typeof window === "undefined") return;
            try {
              // Parse to get the visaId, then write to the correct key
              const parsed = JSON.parse(value);
              const visaId = parsed?.state?.visaId;
              if (visaId) {
                localStorage.setItem(storageKey(visaId), value);
              }
            } catch {
              // ignore
            }
          },
          removeItem: (_name: string) => {
            // Removal is handled explicitly in resetForm
          },
        };
      }),
      partialize: (state): PersistedSlice => ({
        visaId: state.visaId,
        allValues: state.allValues,
        completedSteps: state.completedSteps,
        supplierId: state.supplierId,
      }),
    },
  ),
);

// ── Selector Hooks ────────────────────────────────────────────────────────────
// Use these for fine-grained subscriptions (prevents unnecessary re-renders)

/** Get values for a specific section only */
export function useCurrentSectionValues(sectionId: string) {
  return useVisaFormStore((s) => s.allValues[sectionId] ?? {});
}

/** Get wizard progress stats */
export function useWizardProgress() {
  return useVisaFormStore((s) => {
    const completedCount = s.completedSteps.length;
    const percent =
      s.totalSteps > 0
        ? Math.round(((s.currentStep + 1) / s.totalSteps) * 100)
        : 0;
    return { completedCount, totalSteps: s.totalSteps, percent };
  });
}

/** Check if a step is navigable */
export function useIsStepClickable(step: number) {
  return useVisaFormStore((s) => new Set(s.completedSteps).has(step));
}

/** Get all values (for review/submission) */
export function useAllFormValues() {
  return useVisaFormStore((s) => s.allValues);
}

/** Check if wizard has been hydrated from storage */
export function useWizardHydrated() {
  return useVisaFormStore((s) => s._hydrated);
}
