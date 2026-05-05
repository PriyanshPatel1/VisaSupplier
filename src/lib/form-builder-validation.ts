import type { WizardConfig } from "@/components/form/wizard-types";

type ValidationKey =
  | "visaId"
  | "formLabel"
  | "sections"
  | `section.${number}.id`
  | `section.${number}.title`
  | `section.${number}.fields`
  | `field.${number}.${number}.id`
  | `field.${number}.${number}.label`
  | `field.${number}.${number}.options`
  | `field.${number}.${number}.showIf`;

export interface FormBuilderValidationResult {
  valid: boolean;
  errors: Partial<Record<ValidationKey, string>>;
  issues: string[];
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function addIssue(
  errors: Partial<Record<ValidationKey, string>>,
  issues: string[],
  key: ValidationKey,
  message: string,
) {
  if (!errors[key]) errors[key] = message;
  issues.push(message);
}

export function validateFormBuilderConfig(input: unknown): FormBuilderValidationResult {
  const errors: Partial<Record<ValidationKey, string>> = {};
  const issues: string[] = [];

  if (!isObjectRecord(input)) {
    addIssue(errors, issues, "sections", "Form payload is invalid.");
    return { valid: false, errors, issues };
  }

  const config = input as Partial<WizardConfig>;
  const visaId = getString(config.visaId);
  const formLabel = getString(config.formLabel);
  const sections = Array.isArray(config.sections) ? config.sections : [];

  if (!visaId) {
    addIssue(errors, issues, "visaId", "Visa ID is required.");
  } else if (!/^[a-z0-9-]+$/.test(visaId)) {
    addIssue(errors, issues, "visaId", "Visa ID must use lowercase letters, numbers, and hyphens only.");
  }

  if (!formLabel) {
    addIssue(errors, issues, "formLabel", "Form label is required.");
  }

  if (sections.length === 0) {
    addIssue(errors, issues, "sections", "Add at least one section.");
  }

  const sectionIds = new Set<string>();

  sections.forEach((section, sectionIndex) => {
    const sectionLabel = `Section ${sectionIndex + 1}`;
    const sectionIdKey = `section.${sectionIndex}.id` as const;
    const sectionTitleKey = `section.${sectionIndex}.title` as const;
    const sectionFieldsKey = `section.${sectionIndex}.fields` as const;

    if (!isObjectRecord(section)) {
      addIssue(errors, issues, sectionFieldsKey, `${sectionLabel} is invalid.`);
      return;
    }

    const sectionId = getString(section.id);
    const sectionTitle = getString(section.title);
    const fields = Array.isArray(section.fields) ? section.fields : [];

    if (!sectionId) {
      addIssue(errors, issues, sectionIdKey, `${sectionLabel}: Section ID is required.`);
    } else if (sectionIds.has(sectionId)) {
      addIssue(errors, issues, sectionIdKey, `${sectionLabel}: Section ID "${sectionId}" is duplicated.`);
    } else {
      sectionIds.add(sectionId);
    }

    if (!sectionTitle) {
      addIssue(errors, issues, sectionTitleKey, `${sectionLabel}: Section title is required.`);
    }

    if (fields.length === 0) {
      addIssue(errors, issues, sectionFieldsKey, `${sectionLabel}: Add at least one field.`);
    }

    const fieldIds = new Set<string>();

    fields.forEach((field, fieldIndex) => {
      const fieldLabel = `${sectionLabel}, Field ${fieldIndex + 1}`;
      const fieldIdKey = `field.${sectionIndex}.${fieldIndex}.id` as const;
      const fieldLabelKey = `field.${sectionIndex}.${fieldIndex}.label` as const;
      const fieldOptionsKey = `field.${sectionIndex}.${fieldIndex}.options` as const;
      const fieldShowIfKey = `field.${sectionIndex}.${fieldIndex}.showIf` as const;

      if (!isObjectRecord(field)) {
        addIssue(errors, issues, fieldIdKey, `${fieldLabel} is invalid.`);
        return;
      }

      const fieldId = getString(field.id);
      const label = getString(field.label);

      if (!fieldId) {
        addIssue(errors, issues, fieldIdKey, `${fieldLabel}: Field ID is required.`);
      } else if (fieldIds.has(fieldId)) {
        addIssue(errors, issues, fieldIdKey, `${fieldLabel}: Field ID "${fieldId}" is duplicated in this section.`);
      } else {
        fieldIds.add(fieldId);
      }

      if (!label) {
        addIssue(errors, issues, fieldLabelKey, `${fieldLabel}: Field label is required.`);
      }

      const type = getString(field.type);
      if (type === "select" || type === "radio") {
        const options = Array.isArray(field.options)
          ? field.options.map((option) => getString(option)).filter(Boolean)
          : [];

        if (options.length === 0) {
          addIssue(errors, issues, fieldOptionsKey, `${fieldLabel}: Add at least one option.`);
        }
      }

      if (isObjectRecord(field.showIf)) {
        const watchField = getString(field.showIf.field);
        const watchValue = getString(field.showIf.value);
        if (!watchField || !watchValue) {
          addIssue(
            errors,
            issues,
            fieldShowIfKey,
            `${fieldLabel}: Conditional display needs both a watched field ID and a value.`,
          );
        }
      }
    });
  });

  return {
    valid: issues.length === 0,
    errors,
    issues,
  };
}
