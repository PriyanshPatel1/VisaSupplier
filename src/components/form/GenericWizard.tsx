"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Country, VisaType } from "@/types";
import { useSuppliers } from "@/hooks/useSuppliers";
import SupplierCard from "@/components/SupplierCard";
import { StepNav } from "@/components/form/ui/FormControls";
import { applicationsApi } from "@/lib/api-client";
import { useToast } from "@/components/dashboard/toast";
import { useVisaFormStore } from "@/store/useVisaFormStore";
import { WizardStepper } from "./WizardStepper";
import { WizardSectionForm } from "./WizardSectionForm";
import { WizardReview } from "./WizardReview";
import { WizardPayment } from "./WizardPayment";
import type { WizardConfig } from "./wizard-types";

export type { WizardField, WizardSection, WizardConfig } from "./wizard-types";

interface Props {
  visa: VisaType;
  config: WizardConfig;
  country?: Country;
}

function collectUploadedDocuments(
  config: WizardConfig,
  allValues: Record<string, Record<string, string>>,
) {
  const collected: Record<string, string> = {};

  for (const section of config.sections) {
    const sectionValues = allValues[section.id] ?? {};
    for (const field of section.fields) {
      if (field.type !== "file") continue;
      const value = sectionValues[field.id];
      if (typeof value === "string" && value.trim()) {
        collected[field.id] = value;
      }
    }
  }

  return {
    ...collected,
    ...(allValues.documents ?? {}),
  };
}

export default function GenericWizard({ visa, config, country }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers();
  const { sections } = config;

  const currentStep = useVisaFormStore((s) => s.currentStep);
  const allValues = useVisaFormStore((s) => s.allValues);
  const errors = useVisaFormStore((s) => s.errors);
  const completedSteps = useVisaFormStore((s) => s.completedSteps);
  const supplierId = useVisaFormStore((s) => s.supplierId);
  const showResumeBanner = useVisaFormStore((s) => s.showResumeBanner);
  const totalSteps = useVisaFormStore((s) => s.totalSteps);
  const storeInitWizard = useVisaFormStore((s) => s.initWizard);
  const storeSetFieldValue = useVisaFormStore((s) => s.setFieldValue);
  const storeSetErrors = useVisaFormStore((s) => s.setErrors);
  const storeGoNext = useVisaFormStore((s) => s.goNext);
  const storeGoBack = useVisaFormStore((s) => s.goBack);
  const storeGoToStep = useVisaFormStore((s) => s.goToStep);
  const storeMarkStepComplete = useVisaFormStore((s) => s.markStepComplete);
  const storeSetSupplierId = useVisaFormStore((s) => s.setSupplierId);
  const resetForm = useVisaFormStore((s) => s.resetForm);
  const dismissResumeBanner = useVisaFormStore((s) => s.dismissResumeBanner);

  const completedSet = useMemo(() => new Set(completedSteps), [completedSteps]);
  // Only count completed FORM sections (not supplier/review/payment steps)
  const sectionCompletedCount = useMemo(
    () => completedSteps.filter((s) => s < sections.length).length,
    [completedSteps, sections.length],
  );
  const supplierStep = sections.length;
  const reviewStep = sections.length + 1;
  const paymentStep = sections.length + 2;
  const effectiveSupplierId = supplierId || suppliers[0]?.id || "";

  useEffect(() => {
    storeInitWizard(visa.id, sections.length);
  }, [sections.length, storeInitWizard, visa.id]);

  useEffect(() => {
    if (!supplierId && suppliers.length > 0 && suppliers[0]?.id) {
      storeSetSupplierId(suppliers[0].id);
    }
  }, [supplierId, suppliers, storeSetSupplierId]);

  const currentValues =
    currentStep < sections.length
      ? (allValues[sections[currentStep]?.id] ?? {})
      : {};
  const uploadedDocuments = useMemo(
    () => collectUploadedDocuments(config, allValues),
    [allValues, config],
  );

  const onChange = useCallback(
    (sectionId: string, fieldId: string, value: string) =>
      storeSetFieldValue(sectionId, fieldId, value),
    [storeSetFieldValue],
  );

  const validate = useCallback((): boolean => {
    if (currentStep >= sections.length) return true;

    const section = sections[currentStep];
    const vals = allValues[section.id] ?? {};
    const newErrors: Record<string, string> = {};

    section.fields.forEach((field) => {
      if (!field.required) return;
      if (field.showIf && vals[field.showIf.field] !== field.showIf.value)
        return;
      if (!vals[field.id] || vals[field.id].trim() === "") {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    storeSetErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [allValues, currentStep, sections, storeSetErrors]);

  const handleNext = useCallback(() => {
    if (currentStep === supplierStep) {
      if (suppliersLoading) return;
      if (suppliers.length === 0 || !effectiveSupplierId) {
        showToast("Please select a supplier before continuing.", "error");
        return;
      }
    }

    if (!validate()) {
      document.getElementById("wizard-form-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    storeGoNext();
  }, [
    currentStep,
    effectiveSupplierId,
    showToast,
    storeGoNext,
    supplierStep,
    suppliers,
    suppliersLoading,
    validate,
  ]);

  const handleBack = useCallback(() => storeGoBack(), [storeGoBack]);
  const handleGoTo = useCallback(
    (step: number) => storeGoToStep(step),
    [storeGoToStep],
  );

  const stepTitle =
    currentStep < sections.length
      ? sections[currentStep].title
      : currentStep === supplierStep
        ? "Choose Service Provider"
        : currentStep === reviewStep
          ? "Review and Submit"
          : "Payment";

  const stepDesc =
    currentStep < sections.length
      ? sections[currentStep].description
      : currentStep === supplierStep
        ? "Select the agency that will process your application."
        : currentStep === reviewStep
          ? "Review your details before payment and final submission."
          : "Complete payment to finalise the application.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.15),transparent_28%),linear-gradient(180deg,#08101f_0%,#0b1220_42%,#0d1424_100%)] text-white">
      <div className=" top-17 z-40 border-b border-white/10 bg-[#090f24]/95 shadow-[0_12px_30px_rgba(2,12,27,0.18)] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Link
              href="/countries"
              className="transition-colors hover:text-white"
            >
              Countries
            </Link>
            <span>/</span>
            <Link
              href={`/country/${visa.countryCode}`}
              className="transition-colors hover:text-white"
            >
              {country?.flag} {country?.name}
            </Link>
            <span>/</span>
            <Link
              href={`/visa/${visa.id}`}
              className="transition-colors hover:text-white"
            >
              {visa.name}
            </Link>
            <span>/</span>
            <span className="text-white">Apply</span>
          </div>
          <WizardStepper sections={sections} />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2" id="wizard-form-panel">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(10,15,26,0.96))] shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
              <div className="border-b border-white/8 px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300/85">
                      Step {currentStep + 1} of {totalSteps}
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                      {stepTitle}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm text-slate-300/75">
                      {stepDesc}
                    </p>
                  </div>
                  <div className="min-w-[190px] rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <span>Progress</span>
                      <span>
                        {sectionCompletedCount}/{sections.length}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 transition-all duration-500"
                        style={{
                          width: `${(sectionCompletedCount / sections.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8">
                {showResumeBanner ? (
                  <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-3">
                    <div>
                      <p className="text-sm font-semibold text-indigo-200">
                        Saved progress restored
                      </p>
                      <p className="text-xs text-indigo-100/70">
                        You can continue from where you left off.
                      </p>
                    </div>
                    <button
                      onClick={dismissResumeBanner}
                      className="text-xs font-semibold text-indigo-300 transition-colors hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}

                {Object.keys(errors).length > 0 ? (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-200">
                        Please fix {Object.keys(errors).length} error
                        {Object.keys(errors).length !== 1 ? "s" : ""} before
                        continuing.
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {Object.values(errors)
                          .slice(0, 3)
                          .map((message, index) => (
                            <li key={index} className="text-xs text-red-300/85">
                              {message}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {currentStep < sections.length ? (
                  <>
                    <WizardSectionForm
                      section={sections[currentStep]}
                      values={currentValues}
                      errors={errors}
                      onChange={(fieldId, value) =>
                        onChange(sections[currentStep].id, fieldId, value)
                      }
                    />
                    <div className="mt-8">
                      <StepNav
                        onBack={currentStep > 0 ? handleBack : undefined}
                        onNext={handleNext}
                        nextLabel="Save and continue"
                      />
                    </div>
                  </>
                ) : null}

                {currentStep === supplierStep ? (
                  <div>
                    {suppliersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      </div>
                    ) : suppliers.length === 0 ? (
                      suppliersError ? (
                        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
                          <p className="text-sm font-semibold text-red-200">
                            Unable to load suppliers
                          </p>
                          <p className="mt-1 text-xs text-red-300/80">
                            {suppliersError}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
                          <p className="text-sm font-semibold text-amber-100">
                            No suppliers available yet
                          </p>
                          <p className="mt-1 text-xs text-amber-100/80">
                            Add supplier records in admin to enable
                            service-provider selection for applications.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="mb-6 space-y-4">
                        {suppliers.map((supplier) => (
                          <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            basePrice={visa.fee}
                            selected={effectiveSupplierId === supplier.id}
                            onSelect={() => storeSetSupplierId(supplier.id)}
                          />
                        ))}
                      </div>
                    )}
                    <StepNav
                      onBack={handleBack}
                      onNext={handleNext}
                      nextLabel="Continue to review"
                      nextDisabled={
                        suppliersLoading ||
                        suppliers.length === 0 ||
                        !effectiveSupplierId
                      }
                    />
                  </div>
                ) : null}

                {currentStep === reviewStep
                  ? (() => {
                      const reviewSupplier =
                        suppliers.find(
                          (item) => item.id === effectiveSupplierId,
                        ) ?? suppliers[0];
                      const reviewTotal = Math.round(
                        visa.fee * (reviewSupplier?.priceMultiplier ?? 1),
                      );
                      const reviewServiceFee = Math.max(
                        0,
                        reviewTotal - visa.fee,
                      );
                      return (
                        <WizardReview
                          sections={sections}
                          visa={visa}
                          supplierName={reviewSupplier?.name}
                          visaFee={visa.fee}
                          serviceFee={reviewServiceFee}
                          totalPaid={reviewTotal}
                          onBack={handleBack}
                          onSubmit={() => {
                            storeMarkStepComplete(reviewStep);
                            storeGoToStep(paymentStep);
                          }}
                        />
                      );
                    })()
                  : null}

                {currentStep === paymentStep
                  ? (() => {
                      const supplier =
                        suppliers.find(
                          (item) => item.id === effectiveSupplierId,
                        ) ?? suppliers[0];
                      const totalPaid = Math.round(
                        visa.fee * (supplier?.priceMultiplier ?? 1),
                      );

                      return (
                        <WizardPayment
                          visa={visa}
                          supplier={supplier}
                          totalPaid={totalPaid}
                          onBack={handleBack}
                          onPaid={async () => {
                            if (!supplier?.id) {
                              showToast(
                                "No supplier selected. Please go back and choose a supplier.",
                                "error",
                              );
                              return;
                            }

                            try {
                              await applicationsApi.create({
                                visaId: visa.id,
                                visaName: visa.name,
                                countryCode: visa.countryCode,
                                countryName: country?.name ?? visa.countryCode,
                                supplierId: supplier.id,
                                totalPaid,
                                personal: allValues.personal ?? {},
                                passport: allValues.passport ?? {},
                                travel: allValues.travel ?? {},
                                documents: uploadedDocuments,
                                formData: allValues,
                              });
                              showToast(
                                "Payment successful! Application submitted.",
                                "success",
                              );
                              resetForm();
                              router.push("/user/applications");
                            } catch (error) {
                              console.error(
                                "Failed to save application:",
                                error,
                              );
                              showToast(
                                "Payment captured but application submission failed. Please retry.",
                                "error",
                              );
                            }
                          }}
                        />
                      );
                    })()
                  : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,19,34,0.92),rgba(8,13,24,0.98))] p-5 lg:sticky lg:top-[156px]">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Application Summary
              </h3>
              <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="text-3xl">{country?.flag ?? "Globe"}</span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {visa.name}
                  </p>
                  <p className="text-xs text-gray-500">{country?.name}</p>
                </div>
              </div>
              <div className="mb-4 border-b border-white/10 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                  Form {config.formLabel}
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Base Fee", value: `$${visa.fee}` },
                  { label: "Processing", value: visa.processingTime },
                  { label: "Validity", value: visa.validity },
                  { label: "Max Stay", value: visa.stayDuration },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-2 flex justify-between text-xs text-gray-500">
                  <span>Sections Complete</span>
                  <span>
                    {sectionCompletedCount} / {sections.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{
                      width: `${(sectionCompletedCount / sections.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <svg
                  className="h-3 w-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Progress auto-saved as you go
              </div>
            </div>

            {completedSet.size > 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Completed
                </p>
                <div className="space-y-1">
                  {Array.from(completedSet)
                    .sort((a, b) => a - b)
                    .map(
                      (index) =>
                        index < sections.length && (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleGoTo(index)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <span className="text-green-400">OK</span>
                            <span>{sections[index]?.title}</span>
                          </button>
                        ),
                    )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
