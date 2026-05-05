// ── Wizard shared types ───────────────────────────────────────────────────────

export interface WizardField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "radio"
    | "file"
    | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  showIf?: { field: string; value: string };
  colSpan?: "full";
}

export interface WizardSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  heading?: string;
  infoNote?: string;
  fields: WizardField[];
}

export interface WizardConfig {
  visaId: string;
  formLabel: string;
  sections: WizardSection[];
}
