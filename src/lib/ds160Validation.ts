// ── DS-160 Validation helpers ────────────────────────────────────────────────

export type ValidationErrors = Record<string, string>;

export function required(val: string | undefined, label: string): string | undefined {
  if (!val || val.trim() === "") return `${label} is required`;
}

export function minLength(val: string, min: number, label: string): string | undefined {
  if (val.length < min) return `${label} must be at least ${min} characters`;
}

export function validDate(val: string, label: string): string | undefined {
  if (!val) return `${label} is required`;
  const d = new Date(val);
  if (isNaN(d.getTime())) return `${label} is not a valid date`;
}

export function futureDate(val: string, label: string): string | undefined {
  if (!val) return;
  const d = new Date(val);
  if (d <= new Date()) return `${label} must be a future date`;
}

export function pastDate(val: string, label: string): string | undefined {
  if (!val) return;
  const d = new Date(val);
  if (d >= new Date()) return `${label} must be a past date`;
}

export function validEmail(val: string): string | undefined {
  if (!val) return;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(val)) return "Please enter a valid email address";
}

export function validPhone(val: string): string | undefined {
  if (!val) return;
  const digits = val.replace(/\D/g, "");
  if (digits.length < 7) return "Phone number must have at least 7 digits";
}

// ── Per-step validators ──────────────────────────────────────────────────────

import type { DS160FormData } from "@/types/ds160";

export function validatePersonal(data: DS160FormData["personal"]): ValidationErrors {
  const e: ValidationErrors = {};
  const r = (f: string, l: string) => { const err = required(data[f as keyof typeof data] as string, l); if (err) e[f] = err; };
  r("surname", "Surname");
  r("givenName", "Given Name");
  r("sex", "Sex");
  r("maritalStatus", "Marital Status");
  r("dob", "Date of Birth");
  r("cityOfBirth", "City of Birth");
  r("countryOfBirth", "Country of Birth");
  r("nationality", "Nationality");
  if (data.dob) { const err = pastDate(data.dob, "Date of Birth"); if (err) e.dob = err; }
  return e;
}

export function validatePassport(data: DS160FormData["passport"]): ValidationErrors {
  const e: ValidationErrors = {};
  const r = (f: string, l: string) => { const err = required(data[f as keyof typeof data] as string, l); if (err) e[f] = err; };
  r("passportType", "Passport Type");
  r("passportNumber", "Passport Number");
  r("issuingCountry", "Issuing Country");
  r("issueDate", "Issue Date");
  r("expiryDate", "Expiry Date");
  r("lostPassport", "Lost Passport");
  if (data.expiryDate) { const err = futureDate(data.expiryDate, "Expiry Date"); if (err) e.expiryDate = err; }
  return e;
}

export function validateTravel(data: DS160FormData["travel"]): ValidationErrors {
  const e: ValidationErrors = {};
  const r = (f: string, l: string) => { const err = required(data[f as keyof typeof data] as string, l); if (err) e[f] = err; };
  r("purposeOfTrip", "Purpose of Trip");
  r("intendedArrivalDate", "Intended Arrival Date");
  r("intendedLengthOfStay", "Length of Stay");
  r("addressLine1", "US Address Line 1");
  r("city", "US City");
  r("state", "US State");
  return e;
}

export function validateCompanions(data: DS160FormData["companions"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.travelingWithOthers) e.travelingWithOthers = "Please answer this question";
  return e;
}

export function validatePreviousUSTravel(data: DS160FormData["previousUSTravel"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.beenToUS) e.beenToUS = "Please answer this question";
  if (!data.visaRefused) e.visaRefused = "Please answer this question";
  if (!data.deportedOrRemoved) e.deportedOrRemoved = "Please answer this question";
  return e;
}

export function validateAddressContact(data: DS160FormData["addressContact"]): ValidationErrors {
  const e: ValidationErrors = {};
  const r = (f: string, l: string) => { const err = required(data[f as keyof typeof data] as string, l); if (err) e[f] = err; };
  r("homeAddressLine1", "Home Address");
  r("homeCity", "City");
  r("homeCountry", "Country");
  r("primaryPhone", "Primary Phone");
  r("email", "Email");
  if (data.email) { const err = validEmail(data.email); if (err) e.email = err; }
  if (data.primaryPhone) { const err = validPhone(data.primaryPhone); if (err) e.primaryPhone = err; }
  return e;
}

export function validateSocialMedia(data: DS160FormData["socialMedia"]): ValidationErrors {
  void data;
  return {}; // All optional
}

export function validateUSContact(data: DS160FormData["usContact"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.contactSurname && !data.contactOrganization) e.contactSurname = "Provide a contact name or organization";
  if (!data.relationship) e.relationship = "Relationship is required";
  if (!data.city) e.city = "City is required";
  if (!data.state) e.state = "State is required";
  if (!data.phone) e.phone = "Phone is required";
  return e;
}

export function validateFamily(data: DS160FormData["family"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.fatherSurname) e.fatherSurname = "Father's surname is required";
  if (!data.fatherGivenName) e.fatherGivenName = "Father's given name is required";
  if (!data.motherSurname) e.motherSurname = "Mother's surname is required";
  if (!data.motherGivenName) e.motherGivenName = "Mother's given name is required";
  return e;
}

export function validateSevis(data: DS160FormData["sevis"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.sevisId) e.sevisId = "SEVIS ID is required";
  if (!data.institutionName) e.institutionName = "Institution name is required";
  if (!data.institutionCity) e.institutionCity = "City is required";
  if (!data.institutionState) e.institutionState = "State is required";
  return e;
}

export function validateEducation(data: DS160FormData["education"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.primaryInstitutionName) e.primaryInstitutionName = "Institution name is required";
  if (!data.primaryCourseOfStudy) e.primaryCourseOfStudy = "Course of study is required";
  if (!data.languages) e.languages = "Please list languages you speak";
  return e;
}

export function validateCurrentWork(data: DS160FormData["currentWork"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.employed) e.employed = "Please answer this question";
  return e;
}

export function validatePreviousWork(data: DS160FormData["previousWork"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.previouslyEmployed) e.previouslyEmployed = "Please answer this question";
  return e;
}

export function validateAdditional(data: DS160FormData["additional"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.languages) e.languages = "Please list languages you speak";
  return e;
}

export function validateFunding(data: DS160FormData["funding"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.fundsAvailable) e.fundsAvailable = "Funds available is required";
  if (!data.sponsor) e.sponsor = "Please indicate who is sponsoring";
  return e;
}

export function validateSecurity(data: DS160FormData["security"]): ValidationErrors {
  const e: ValidationErrors = {};
  const fields = [
    "hasDisease", "hasMentalDisorder", "isDrugAddict",
    "hasCommittedCrime", "hasBeenArrested", "hasViolatedVisa",
    "hasChildSupport", "hasLiedToOfficer",
    "isIntendingTerrorist", "isMemberOfTerrorGroup", "isAssistingTerrorist",
  ];
  fields.forEach((f) => {
    if (!data[f as keyof typeof data]) e[f] = "Please answer this question";
  });
  return e;
}

export function validatePhoto(data: DS160FormData["photo"]): ValidationErrors {
  const e: ValidationErrors = {};
  if (!data.photo) e.photo = "Please upload your photo";
  return e;
}

// Map step index → validator
export const STEP_VALIDATORS = [
  validatePersonal,
  validatePassport,
  validateTravel,
  validateCompanions,
  validatePreviousUSTravel,
  validateAddressContact,
  validateSocialMedia,
  validateUSContact,
  validateFamily,
  validateSevis,
  validateEducation,
  validateCurrentWork,
  validatePreviousWork,
  validateAdditional,
  validateFunding,
  validateSecurity,
  validatePhoto,
  () => ({}), // review step — no validation
] as const;
