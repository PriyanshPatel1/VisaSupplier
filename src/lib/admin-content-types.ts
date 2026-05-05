import type { VisaType } from "@/types";

export type StoredCountry = {
  id: string;
  name: string;
  code: string;
  flag: string;
  description: string;
  continent: string;
  source?: "static" | "custom";
};

export type StoredVisa = {
  id: string;
  name: string;
  countryCode: string;
  category: VisaType["category"];
  fee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description: string;
  source: "static" | "custom";
  documentsRequired?: string[];
  formSchemaId?: string;
};
