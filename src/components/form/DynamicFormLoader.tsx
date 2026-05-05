"use client";

import type { Country, VisaType } from "@/types";
import type { WizardConfig } from "@/components/form/GenericWizard";
import GenericWizard from "@/components/form/GenericWizard";

interface Props {
  visa: VisaType;
  config: WizardConfig;
  country?: Country;
}

export default function DynamicFormLoader({ visa, config, country }: Props) {
  return <GenericWizard visa={visa} config={config} country={country} />;
}
