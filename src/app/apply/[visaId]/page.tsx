"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import type { Country, VisaType } from "@/types";
import type { WizardConfig } from "@/components/form/GenericWizard";
import DynamicFormLoader from "@/components/form/DynamicFormLoader";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070d1f]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-300/45 border-t-indigo-300" />
    </div>
  );
}

function MissingFormState({ visa, country }: { visa: VisaType; country?: Country }) {
  return (
    <div className="min-h-screen bg-[#070d1f] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-indigo-300/15 bg-[#0b1431] p-8 shadow-2xl shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200/70">
          Application unavailable
        </p>
        <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Form configuration is missing for {visa.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-indigo-100/70">
          This visa application is now database-driven, but no published form config was found for
          this visa yet. Please ask an admin to publish the form from the admin panel.
        </p>

        <div className="mt-6 rounded-2xl border border-indigo-300/12 bg-[#091022] p-4 text-sm text-indigo-100/72">
          <p className="font-semibold text-white">{visa.name}</p>
          <p className="mt-1">
            Destination: {country?.flag} {country?.name ?? visa.countryCode}
          </p>
          <p className="mt-1">Visa ID: {visa.id}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/visa/${visa.id}`} className="rounded-xl border border-indigo-300/20 px-4 py-2 text-sm font-semibold text-indigo-100/85 hover:bg-white/5">
            Back to visa details
          </Link>
          <Link href="/countries" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Browse countries
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage({ params }: { params: Promise<{ visaId: string }> }) {
  const { visaId } = use(params);
  const { visas, countries, loading: catalogLoading } = useContentCatalog();
  const [formConfig, setFormConfig] = useState<WizardConfig | null>(null);
  const [formConfigLoading, setFormConfigLoading] = useState(true);

  const visa = visas.find((item) => item.id === visaId);
  const country = countries.find((item) => item.code === visa?.countryCode);

  useEffect(() => {
    let cancelled = false;

    const loadFormConfig = async () => {
      if (!visa) return;

      setFormConfigLoading(true);
      try {
        const candidates = Array.from(new Set([visa.formSchemaId, visaId].filter(Boolean)));
        let resolvedConfig: WizardConfig | null = null;

        for (const candidate of candidates) {
          const response = await fetch(`/api/content/forms/${candidate}`, {
            credentials: "include",
            cache: "no-store",
          });
          const json = (await response.json()) as {
            ok?: boolean;
            data?: { config?: WizardConfig | null };
            error?: string;
          };

          if (response.ok && json.ok && json.data?.config) {
            resolvedConfig = json.data.config;
            break;
          }
        }

        if (cancelled) return;
        setFormConfig(resolvedConfig);
      } catch {
        if (cancelled) return;
        setFormConfig(null);
      } finally {
        if (!cancelled) {
          setFormConfigLoading(false);
        }
      }
    };

    loadFormConfig();
    return () => {
      cancelled = true;
    };
  }, [visa, visaId]);

  if (!visa && !catalogLoading) {
    notFound();
  }

  if (!visa || catalogLoading || formConfigLoading) {
    return <LoadingScreen />;
  }

  if (!formConfig) {
    return <MissingFormState visa={visa} country={country} />;
  }

  return <DynamicFormLoader visa={visa} country={country} config={formConfig} />;
}
