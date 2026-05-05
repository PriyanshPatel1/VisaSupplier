// ── DS-160 F1 Student Visa – Full TypeScript Types ──────────────────────────

export interface PersonalInfo {
  surname: string;
  givenName: string;
  fullNameNative: string;
  otherNamesUsed: string;
  sex: string;
  maritalStatus: string;
  dob: string;
  cityOfBirth: string;
  countryOfBirth: string;
  nationality: string;
}

export interface PassportDetails {
  passportType: string;
  passportNumber: string;
  bookNumber: string;
  issuingCountry: string;
  issuingCity: string;
  issueDate: string;
  expiryDate: string;
  lostPassport: string;
  lostPassportDetails: string;
}

export interface TravelInfo {
  purposeOfTrip: string;
  intendedArrivalDate: string;
  intendedLengthOfStay: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  paidPersonName: string;
  paidPersonPhone: string;
  paidPersonRelationship: string;
}

export interface TravelCompanion {
  id: string;
  surname: string;
  givenName: string;
  relationship: string;
}

export interface TravelCompanions {
  travelingWithOthers: string;
  groupTravel: string;
  companions: TravelCompanion[];
}

export interface PreviousUSTravel {
  beenToUS: string;
  lastArrivalDate: string;
  lastLengthOfStay: string;
  lastUsLocation: string;
  previousVisaNumber: string;
  visaIssuedDate: string;
  visaRefused: string;
  visaRefusedDetails: string;
  deportedOrRemoved: string;
  deportedDetails: string;
}

export interface AddressContact {
  homeAddressLine1: string;
  homeAddressLine2: string;
  homeCity: string;
  homeState: string;
  homePostalCode: string;
  homeCountry: string;
  primaryPhone: string;
  secondaryPhone: string;
  workPhone: string;
  email: string;
}

export interface SocialMedia {
  facebookIdentifier: string;
  instagramIdentifier: string;
  linkedinIdentifier: string;
  twitterIdentifier: string;
  youtubeIdentifier: string;
  otherPlatform: string;
  otherIdentifier: string;
}

export interface USContact {
  contactSurname: string;
  contactGivenName: string;
  contactOrganization: string;
  relationship: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

export interface FamilyInfo {
  fatherSurname: string;
  fatherGivenName: string;
  fatherDob: string;
  fatherInUS: string;
  fatherUSStatus: string;
  motherSurname: string;
  motherGivenName: string;
  motherDob: string;
  motherInUS: string;
  motherUSStatus: string;
  immediateRelativesInUS: string;
  otherRelativesInUS: string;
}

export interface SevisInfo {
  sevisId: string;
  programNumber: string;
  institutionName: string;
  institutionAddressLine1: string;
  institutionAddressLine2: string;
  institutionCity: string;
  institutionState: string;
  institutionZipCode: string;
  institutionPhone: string;
}

export interface Education {
  primaryInstitutionName: string;
  primaryCityOfInstitution: string;
  primaryCountry: string;
  primaryCourseOfStudy: string;
  primaryDateAttendedFrom: string;
  primaryDateAttendedTo: string;
  languages: string;
}

export interface WorkEntry {
  id: string;
  employer: string;
  employerAddress: string;
  phone: string;
  jobTitle: string;
  supervisorName: string;
  employedFrom: string;
  employedTo: string;
  duties: string;
}

export interface CurrentWork {
  employed: string;
  presentEmployer: string;
  presentEmployerAddress: string;
  presentEmployerPhone: string;
  presentJobTitle: string;
  supervisorSurname: string;
  supervisorGivenName: string;
  employedFrom: string;
  monthlyIncome: string;
  jobDuties: string;
}

export interface PreviousWork {
  previouslyEmployed: string;
  previousEmployers: WorkEntry[];
}

export interface AdditionalInfo {
  clan: string;
  languages: string;
  countriesVisited: string;
  belongToOrganizations: string;
  organizationDetails: string;
  servedMilitary: string;
  militaryCountry: string;
  militaryBranch: string;
  militaryRank: string;
  militarySpecialty: string;
  servedInArmyCombat: string;
  combatDetails: string;
}

export interface Funding {
  annualIncome: string;
  fundsAvailable: string;
  sponsor: string;
  sponsorAmount: string;
  schoolFunds: string;
  otherFunds: string;
  otherFundsExplanation: string;
}

export interface SecurityQuestions {
  hasDisease: string;
  hasMentalDisorder: string;
  isDrugAddict: string;
  hasCommittedCrime: string;
  crimeDetails: string;
  hasBeenArrested: string;
  hasViolatedVisa: string;
  hasChildSupport: string;
  hasLiedToOfficer: string;
  isIntendingTerrorist: string;
  isMemberOfTerrorGroup: string;
  isAssistingTerrorist: string;
}

export interface PhotoUpload {
  photo: string; // base64 or filename mock
}

// ── Master form state ────────────────────────────────────────────────────────

export interface DS160FormData {
  personal: Partial<PersonalInfo>;
  passport: Partial<PassportDetails>;
  travel: Partial<TravelInfo>;
  companions: Partial<TravelCompanions>;
  previousUSTravel: Partial<PreviousUSTravel>;
  addressContact: Partial<AddressContact>;
  socialMedia: Partial<SocialMedia>;
  usContact: Partial<USContact>;
  family: Partial<FamilyInfo>;
  sevis: Partial<SevisInfo>;
  education: Partial<Education>;
  currentWork: Partial<CurrentWork>;
  previousWork: Partial<PreviousWork>;
  additional: Partial<AdditionalInfo>;
  funding: Partial<Funding>;
  security: Partial<SecurityQuestions>;
  photo: Partial<PhotoUpload>;
}

export const DS160_STEPS = [
  { id: "personal",        label: "Personal",       description: "Personal information as on passport" },
  { id: "passport",        label: "Passport",        description: "Passport & travel document details" },
  { id: "travel",          label: "Travel",          description: "Purpose and details of your US trip" },
  { id: "companions",      label: "Companions",      description: "Travel companions if any" },
  { id: "previousUSTravel",label: "US Travel",       description: "Previous travel to the United States" },
  { id: "addressContact",  label: "Address",         description: "Your home address and contact info" },
  { id: "socialMedia",     label: "Social Media",    description: "Social media identifiers" },
  { id: "usContact",       label: "US Contact",      description: "Point of contact in the United States" },
  { id: "family",          label: "Family",          description: "Information about your family" },
  { id: "sevis",           label: "SEVIS",           description: "SEVIS ID and school information" },
  { id: "education",       label: "Education",       description: "Your educational background" },
  { id: "currentWork",     label: "Current Work",    description: "Current employment information" },
  { id: "previousWork",    label: "Prev. Work",      description: "Previous employment history" },
  { id: "additional",      label: "Additional",      description: "Additional background information" },
  { id: "funding",         label: "Funding",         description: "How your studies will be funded" },
  { id: "security",        label: "Security",        description: "Security and background questions" },
  { id: "photo",           label: "Photo",           description: "Upload your passport-style photo" },
  { id: "review",          label: "Review",          description: "Review and submit your application" },
] as const;

export type DS160StepId = typeof DS160_STEPS[number]["id"];

export const EMPTY_DS160: DS160FormData = {
  personal: {},
  passport: {},
  travel: {},
  companions: { companions: [] },
  previousUSTravel: {},
  addressContact: {},
  socialMedia: {},
  usContact: {},
  family: {},
  sevis: {},
  education: {},
  currentWork: {},
  previousWork: { previousEmployers: [] },
  additional: {},
  funding: {},
  security: {},
  photo: {},
};
