"use client";

import React, { createContext, useContext, useEffect } from "react";
import { ApplicationFormData, StepId } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { useVisaFormStore } from "@/store/useVisaFormStore";

// ── Context (backward-compatible shim over Zustand) ──────────────────────────

interface ApplicationContextType {
  visaId: string;
  currentStep: number;
  totalSteps: number;
  formData: ApplicationFormData;
  updateFormData: (step: keyof ApplicationFormData, data: Record<string, string>) => void;
  updateSupplier: (id: string) => void;
  goToStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  resetForm: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

/**
 * ApplicationProvider — backward-compatible wrapper.
 *
 * Legacy components (Stepper, DynamicForm, FileUpload, ReviewPage, PaymentPage)
 * import `useApplication()` from this file. Instead of duplicating state, we
 * now delegate everything to the centralised Zustand store.
 */
export function ApplicationProvider({
  children,
  visaId,
}: {
  children: React.ReactNode;
  visaId: string;
}) {
  useAuth(); // keep auth dependency for legacy callers

  const currentStep = useVisaFormStore((s) => s.currentStep);
  const totalSteps = useVisaFormStore((s) => s.totalSteps);
  const allValues = useVisaFormStore((s) => s.allValues);
  const supplierId = useVisaFormStore((s) => s.supplierId);
  const initWizard = useVisaFormStore((s) => s.initWizard);

  // Initialise the store for this visa (7 legacy steps = sections count of 4 + supplier + review + payment)
  useEffect(() => {
    initWizard(visaId, 4);
  }, [visaId, initWizard]);

  // Bridge allValues → ApplicationFormData shape
  const formData: ApplicationFormData = {
    personal: allValues["personal"],
    passport: allValues["passport"],
    travel: allValues["travel"],
    documents: allValues["documents"],
    supplierId: supplierId || undefined,
  };

  const updateFormData = (step: keyof ApplicationFormData, data: Record<string, string>) => {
    const sectionId = String(step);
    const store = useVisaFormStore.getState();
    Object.entries(data).forEach(([fieldId, value]) => {
      store.setFieldValue(sectionId, fieldId, value);
    });
  };

  const updateSupplier = (id: string) => {
    useVisaFormStore.getState().setSupplierId(id);
  };

  const goToStep = (step: number) => {
    useVisaFormStore.getState().goToStep(step);
  };

  const goNext = () => {
    useVisaFormStore.getState().goNext();
  };

  const goPrev = () => {
    useVisaFormStore.getState().goBack();
  };

  const resetForm = () => {
    useVisaFormStore.getState().resetForm();
  };

  return (
    <ApplicationContext.Provider
      value={{
        visaId,
        currentStep,
        totalSteps,
        formData,
        updateFormData,
        updateSupplier,
        goToStep,
        goNext,
        goPrev,
        isLastStep: currentStep === totalSteps - 1,
        isFirstStep: currentStep === 0,
        resetForm,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error("useApplication must be used within ApplicationProvider");
  return context;
}

export const STEPS: { id: StepId; label: string; description: string }[] = [
  { id: "personal", label: "Personal", description: "Your personal details" },
  { id: "passport", label: "Passport", description: "Passport information" },
  { id: "travel", label: "Travel", description: "Travel plans" },
  { id: "documents", label: "Documents", description: "Upload documents" },
  { id: "supplier", label: "Supplier", description: "Choose a service provider" },
  { id: "review", label: "Review", description: "Review your application" },
  { id: "payment", label: "Payment", description: "Complete payment" },
];
