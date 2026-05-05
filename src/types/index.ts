// Core data types for VisaHub platform

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string; // emoji flag
  description?: string;
  continent?: string;
}

export interface VisaType {
  id: string;
  countryCode: string;
  name: string;
  category: string;
  processingTime: string;
  validity: string;
  stayDuration: string;
  fee: number;
  documentsRequired: string[];
  formSchemaId: string;
  description?: string;
}

export type FieldType = "text" | "date" | "select" | "number" | "file" | "group" | "email" | "tel";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  fields?: FormField[]; // for group type
}

export interface FormSchema {
  id: string;
  fields: FormField[];
}

export interface Supplier {
  id: string;
  name: string;
  type: "embassy" | "agent";
  priceMultiplier: number;
  processingTime: string;
  rating?: number;
  description?: string;
}

// Application form data collected across all steps
export interface ApplicationFormData {
  // Step 1 - Personal Info
  personal?: Record<string, string>;
  // Step 2 - Passport Info
  passport?: Record<string, string>;
  // Step 3 - Travel Info
  travel?: Record<string, string>;
  // Step 4 - Documents (mock file names)
  documents?: Record<string, string>;
  // Step 5 - Selected Supplier
  supplierId?: string;
  // Step 6 - Review (no extra data)
  // Step 7 - Payment
  payment?: {
    cardNumber?: string;
    cardName?: string;
    expiry?: string;
    cvv?: string;
  };
}

export type StepId =
  | "personal"
  | "passport"
  | "travel"
  | "documents"
  | "supplier"
  | "review"
  | "payment";

export interface Step {
  id: StepId;
  label: string;
  description: string;
}
