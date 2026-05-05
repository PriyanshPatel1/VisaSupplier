import type { WizardConfig } from "@/components/form/GenericWizard";

const COUNTRIES = ["India","Pakistan","Bangladesh","Sri Lanka","Nepal","China","Nigeria","Ghana","United Kingdom","Canada","Australia","Germany","France","Brazil","South Korea","Japan","United States","Other"];
const MARITAL = ["Single","Married","Widowed","Divorced","Separated","Other"];
const YesNo = ["Yes","No"];
const US_STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington D.C."];

// ── US Tourist B-1/B-2 Visa ───────────────────────────────────────────────────
export const usTouristConfig: WizardConfig = {
  visaId: "us-tourist",
  formLabel: "B-1/B-2 Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Enter your personal details exactly as on your passport",
      icon: "👤",
      infoNote: "Enter your name exactly as it appears on your passport.",
      fields: [
        { id: "surname",       label: "Surnames / Family Name",     type: "text",   required: true,  placeholder: "SMITH" },
        { id: "givenName",     label: "Given Names",                type: "text",   required: true,  placeholder: "JOHN WILLIAM" },
        { id: "sex",           label: "Sex",                        type: "radio",  required: true,  options: ["Male","Female"] },
        { id: "maritalStatus", label: "Marital Status",             type: "select", required: true,  options: MARITAL },
        { id: "dob",           label: "Date of Birth",              type: "date",   required: true },
        { id: "cityOfBirth",   label: "City of Birth",              type: "text",   required: true,  placeholder: "Mumbai" },
        { id: "countryOfBirth",label: "Country of Birth",           type: "select", required: true,  options: COUNTRIES },
        { id: "nationality",   label: "Country of Nationality",     type: "select", required: true,  options: COUNTRIES },
        { id: "email",         label: "Email Address",              type: "email",  required: true,  placeholder: "john@example.com" },
        { id: "phone",         label: "Phone Number",               type: "tel",    required: true,  placeholder: "+91 9876543210" },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your current passport information",
      icon: "🛂",
      fields: [
        { id: "passportNumber",  label: "Passport Number",         type: "text",   required: true, placeholder: "A1234567" },
        { id: "issuingCountry",  label: "Issuing Country",         type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",       label: "Issue Date",              type: "date",   required: true },
        { id: "expiryDate",      label: "Expiry Date",             type: "date",   required: true },
        { id: "lostPassport",    label: "Have you ever lost a passport?", type: "radio", required: true, options: YesNo },
      ],
    },
    {
      id: "travel",
      title: "Travel Information",
      description: "Details about your intended trip to the United States",
      icon: "✈️",
      infoNote: "Provide the address where you will stay during your visit.",
      fields: [
        { id: "purposeOfTrip",      label: "Purpose of Trip",          type: "select", required: true, options: ["Tourism","Visiting Family/Friends","Business Meeting","Medical Treatment","Conference/Event","Other"] },
        { id: "arrivalDate",        label: "Intended Arrival Date",    type: "date",   required: true },
        { id: "lengthOfStay",       label: "Length of Stay",           type: "select", required: true, options: ["Less than 1 month","1–3 months","3–6 months","Other"] },
        { id: "usAddressLine1",     label: "US Address Line 1",        type: "text",   required: true, placeholder: "123 Main St", colSpan: "full" },
        { id: "usCity",             label: "US City",                  type: "text",   required: true, placeholder: "New York" },
        { id: "usState",            label: "US State",                 type: "select", required: true, options: US_STATES },
        { id: "previousUSTravel",   label: "Have you been to the US before?", type: "radio", required: true, options: YesNo },
        { id: "previousVisaNumber", label: "Previous US Visa Number",  type: "text",   placeholder: "Leave blank if none", showIf: { field: "previousUSTravel", value: "Yes" } },
        { id: "visaRefused",        label: "Have you ever been refused a US visa?", type: "radio", required: true, options: YesNo },
        { id: "visaRefusedDetails", label: "Refusal Details",          type: "textarea", placeholder: "Location, year, reason", showIf: { field: "visaRefused", value: "Yes" }, colSpan: "full" },
      ],
    },
    {
      id: "contact",
      title: "Address & Contact",
      description: "Your home address and contact information",
      icon: "🏠",
      fields: [
        { id: "homeAddress",   label: "Home Address",          type: "text",   required: true, placeholder: "123 MG Road, Bangalore", colSpan: "full" },
        { id: "homeCity",      label: "City",                  type: "text",   required: true, placeholder: "Bangalore" },
        { id: "homeCountry",   label: "Country",               type: "select", required: true, options: COUNTRIES },
        { id: "primaryPhone",  label: "Primary Phone",         type: "tel",    required: true, placeholder: "+91 9876543210" },
        { id: "email",         label: "Email Address",         type: "email",  required: true, placeholder: "john@example.com" },
      ],
    },
    {
      id: "financial",
      title: "Financial Information",
      description: "How your trip will be funded",
      icon: "💰",
      fields: [
        { id: "fundingSource",  label: "Source of Funds",          type: "select", required: true, options: ["Personal Savings","Family Sponsor","Employer","Scholarship","Other"] },
        { id: "availableFunds", label: "Available Funds (USD)",    type: "number", required: true, placeholder: "5000" },
        { id: "sponsorName",    label: "Sponsor Name (if applicable)", type: "text", placeholder: "Leave blank if self-funded" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Upload required supporting documents",
      icon: "📎",
      infoNote: "Upload clear scans. Passport copy and photo are mandatory.",
      fields: [
        { id: "passportCopy",    label: "Passport Copy (color scan)", type: "file", required: true },
        { id: "photo",           label: "Passport-size Photo",        type: "file", required: true },
        { id: "bankStatement",   label: "Bank Statement (last 3 months)", type: "file", required: true },
        { id: "travelItinerary", label: "Travel Itinerary",           type: "file" },
        { id: "hotelBooking",    label: "Hotel Booking Confirmation", type: "file" },
        { id: "returnTicket",    label: "Return Flight Ticket",       type: "file" },
      ],
    },
  ],
};

// ── US H-1B Work Visa ─────────────────────────────────────────────────────────
export const usWorkConfig: WizardConfig = {
  visaId: "us-work",
  formLabel: "H-1B Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Personal details as on your passport",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Surnames / Family Name",  type: "text",   required: true, placeholder: "SMITH" },
        { id: "givenName",     label: "Given Names",             type: "text",   required: true, placeholder: "JOHN" },
        { id: "sex",           label: "Sex",                     type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",           label: "Date of Birth",           type: "date",   required: true },
        { id: "countryOfBirth",label: "Country of Birth",        type: "select", required: true, options: COUNTRIES },
        { id: "nationality",   label: "Country of Nationality",  type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email Address",           type: "email",  required: true, placeholder: "john@example.com" },
        { id: "phone",         label: "Phone Number",            type: "tel",    required: true, placeholder: "+91 9876543210" },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your current passport information",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true, placeholder: "A1234567" },
        { id: "issuingCountry", label: "Issuing Country",  type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",      label: "Issue Date",       type: "date",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "employer",
      title: "US Employer Details",
      description: "Information about your sponsoring employer in the United States",
      icon: "🏢",
      infoNote: "Your employer must file Form I-129 on your behalf before you can apply for the H-1B visa.",
      fields: [
        { id: "employerName",    label: "Employer / Company Name",      type: "text",   required: true, placeholder: "Google LLC" },
        { id: "employerAddress", label: "Employer US Address",          type: "text",   required: true, placeholder: "1600 Amphitheatre Pkwy, Mountain View, CA", colSpan: "full" },
        { id: "employerPhone",   label: "Employer Phone",               type: "tel",    required: true, placeholder: "+1 650 000 0000" },
        { id: "jobTitle",        label: "Job Title / Position",         type: "text",   required: true, placeholder: "Software Engineer" },
        { id: "annualSalary",    label: "Annual Salary (USD)",          type: "number", required: true, placeholder: "120000" },
        { id: "startDate",       label: "Intended Start Date",          type: "date",   required: true },
        { id: "lcaNumber",       label: "LCA Case Number",              type: "text",   required: true, placeholder: "I-200-XXXXX-XXXXXX" },
        { id: "i129Receipt",     label: "I-129 Receipt Number",         type: "text",   required: true, placeholder: "WAC-XX-XXX-XXXXX" },
        { id: "jobDuties",       label: "Brief Description of Job Duties", type: "textarea", required: true, colSpan: "full", placeholder: "Describe the specialty occupation duties..." },
      ],
    },
    {
      id: "education",
      title: "Education & Qualifications",
      description: "Your educational background and professional qualifications",
      icon: "🎓",
      fields: [
        { id: "highestDegree",    label: "Highest Degree Obtained",     type: "select", required: true, options: ["Bachelor's","Master's","PhD","Other"] },
        { id: "fieldOfStudy",     label: "Field of Study",              type: "text",   required: true, placeholder: "Computer Science" },
        { id: "university",       label: "University / Institution",    type: "text",   required: true, placeholder: "IIT Bombay" },
        { id: "graduationYear",   label: "Graduation Year",             type: "text",   required: true, placeholder: "2020" },
        { id: "yearsExperience",  label: "Years of Relevant Experience",type: "number", required: true, placeholder: "3" },
        { id: "licenses",         label: "Professional Licenses / Certifications (if any)", type: "textarea", placeholder: "AWS Certified, PMP, etc.", colSpan: "full" },
      ],
    },
    {
      id: "travelHistory",
      title: "Travel & Immigration History",
      description: "Previous US travel and immigration information",
      icon: "🇺🇸",
      fields: [
        { id: "previousUSTravel",  label: "Have you previously worked in the US?", type: "radio", required: true, options: YesNo },
        { id: "previousVisaType",  label: "Previous Visa Type",         type: "text",   placeholder: "e.g. H-1B, L-1, OPT", showIf: { field: "previousUSTravel", value: "Yes" } },
        { id: "visaRefused",       label: "Have you ever been refused a US visa?", type: "radio", required: true, options: YesNo },
        { id: "visaRefusedDetails",label: "Refusal Details",            type: "textarea", showIf: { field: "visaRefused", value: "Yes" }, colSpan: "full" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Upload all required supporting documents",
      icon: "📎",
      infoNote: "All documents must be clear, legible scans. PDF or image formats accepted.",
      fields: [
        { id: "passportCopy",      label: "Passport Copy",               type: "file", required: true },
        { id: "photo",             label: "Passport-size Photo",          type: "file", required: true },
        { id: "i129Approval",      label: "I-129 Approval Notice (I-797)",type: "file", required: true },
        { id: "lcaDocument",       label: "Labor Condition Application",  type: "file", required: true },
        { id: "degreeTranscript",  label: "Degree Certificate & Transcripts", type: "file", required: true },
        { id: "employmentLetter",  label: "Employer Support Letter",      type: "file", required: true },
        { id: "resumeCv",          label: "Resume / CV",                  type: "file" },
        { id: "previousPayslips",  label: "Previous Pay Slips (if applicable)", type: "file" },
      ],
    },
  ],
};

// ── UK Standard Visitor (Tourist) ────────────────────────────────────────────
export const gbTouristConfig: WizardConfig = {
  visaId: "gb-tourist",
  formLabel: "UK Visitor Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Family Name",              type: "text",   required: true, placeholder: "SMITH" },
        { id: "givenName",     label: "Given Names",              type: "text",   required: true, placeholder: "JOHN" },
        { id: "sex",           label: "Sex",                      type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",           label: "Date of Birth",            type: "date",   required: true },
        { id: "nationality",   label: "Nationality",              type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email Address",            type: "email",  required: true, placeholder: "john@example.com" },
        { id: "phone",         label: "Phone Number",             type: "tel",    required: true, placeholder: "+91 9876543210" },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Current passport information",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true, placeholder: "A1234567" },
        { id: "issuingCountry", label: "Issuing Country",  type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",      label: "Issue Date",       type: "date",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "travel",
      title: "Visit Details",
      description: "Details about your visit to the United Kingdom",
      icon: "✈️",
      fields: [
        { id: "purposeOfVisit",  label: "Purpose of Visit",       type: "select", required: true, options: ["Tourism","Visiting Family/Friends","Business Meeting","Conference","Medical","Other"] },
        { id: "arrivalDate",     label: "Intended Arrival Date",  type: "date",   required: true },
        { id: "departureDate",   label: "Intended Departure Date",type: "date",   required: true },
        { id: "ukAddress",       label: "UK Address / Hotel",     type: "text",   required: true, placeholder: "The Savoy, Strand, London", colSpan: "full" },
        { id: "fundingSource",   label: "How will you fund your visit?", type: "select", required: true, options: ["Personal Savings","Family Sponsor","Employer","Other"] },
        { id: "availableFunds",  label: "Available Funds (GBP)",  type: "number", required: true, placeholder: "3000" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Supporting documents for your application",
      icon: "📎",
      fields: [
        { id: "passportCopy",    label: "Passport Copy",               type: "file", required: true },
        { id: "photo",           label: "Passport-size Photo",          type: "file", required: true },
        { id: "bankStatement",   label: "Bank Statement (last 3 months)", type: "file", required: true },
        { id: "proofOfAccomm",   label: "Proof of Accommodation",      type: "file", required: true },
        { id: "returnTicket",    label: "Return Ticket",               type: "file" },
        { id: "employmentProof", label: "Employment / Income Proof",   type: "file" },
      ],
    },
  ],
};

// ── UK Student Visa ───────────────────────────────────────────────────────────
export const gbStudentConfig: WizardConfig = {
  visaId: "gb-student",
  formLabel: "UK Student Visa",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Personal details as on your passport",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Family Name",           type: "text",   required: true, placeholder: "SMITH" },
        { id: "givenName",     label: "Given Names",           type: "text",   required: true, placeholder: "JOHN" },
        { id: "sex",           label: "Sex",                   type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",           label: "Date of Birth",         type: "date",   required: true },
        { id: "nationality",   label: "Nationality",           type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email Address",         type: "email",  required: true, placeholder: "john@example.com" },
        { id: "phone",         label: "Phone Number",          type: "tel",    required: true, placeholder: "+91 9876543210" },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document information",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true },
        { id: "issuingCountry", label: "Issuing Country",  type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",      label: "Issue Date",       type: "date",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "course",
      title: "Course & Institution",
      description: "Details about your course of study in the UK",
      icon: "🎓",
      infoNote: "You must have a CAS (Confirmation of Acceptance for Studies) reference number from your institution.",
      fields: [
        { id: "casNumber",       label: "CAS Reference Number",   type: "text",   required: true, placeholder: "X1X123456789012" },
        { id: "institutionName", label: "Institution Name",       type: "text",   required: true, placeholder: "University of Oxford" },
        { id: "courseTitle",     label: "Course Title",           type: "text",   required: true, placeholder: "MSc Computer Science" },
        { id: "courseLevel",     label: "Course Level",           type: "select", required: true, options: ["Undergraduate","Postgraduate Taught","Postgraduate Research","Foundation","Other"] },
        { id: "courseStartDate", label: "Course Start Date",      type: "date",   required: true },
        { id: "courseEndDate",   label: "Course End Date",        type: "date",   required: true },
        { id: "tuitionFee",      label: "Annual Tuition Fee (GBP)", type: "number", required: true, placeholder: "20000" },
      ],
    },
    {
      id: "financial",
      title: "Financial Evidence",
      description: "Proof you can support yourself during your studies",
      icon: "💰",
      fields: [
        { id: "fundsAvailable",  label: "Total Funds Available (GBP)", type: "number", required: true, placeholder: "30000" },
        { id: "fundingSource",   label: "Source of Funds",             type: "select", required: true, options: ["Personal/Family","Government Scholarship","University Scholarship","Bank Loan","Other"] },
        { id: "englishTest",     label: "English Language Test",       type: "select", required: true, options: ["IELTS","TOEFL","PTE Academic","Cambridge","Exempt (taught in English)"] },
        { id: "englishScore",    label: "Overall Score",               type: "text",   required: true, placeholder: "7.0" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for your student visa application",
      icon: "📎",
      fields: [
        { id: "passportCopy",    label: "Passport Copy",               type: "file", required: true },
        { id: "photo",           label: "Passport-size Photo",          type: "file", required: true },
        { id: "casLetter",       label: "CAS / Offer Letter",           type: "file", required: true },
        { id: "bankStatement",   label: "Bank Statement",               type: "file", required: true },
        { id: "englishCert",     label: "English Proficiency Certificate", type: "file", required: true },
        { id: "academicTranscripts", label: "Academic Transcripts",    type: "file" },
      ],
    },
  ],
};

// ── UK Business Visitor ───────────────────────────────────────────────────────
export const gbBusinessConfig: WizardConfig = {
  visaId: "gb-business",
  formLabel: "UK Business Visitor",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Family Name",           type: "text",   required: true, placeholder: "SMITH" },
        { id: "givenName",     label: "Given Names",           type: "text",   required: true, placeholder: "JOHN" },
        { id: "sex",           label: "Sex",                   type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",           label: "Date of Birth",         type: "date",   required: true },
        { id: "nationality",   label: "Nationality",           type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email Address",         type: "email",  required: true },
        { id: "phone",         label: "Phone Number",          type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document information",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true },
        { id: "issuingCountry", label: "Issuing Country",  type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",      label: "Issue Date",       type: "date",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "business",
      title: "Business Details",
      description: "Information about your business visit to the UK",
      icon: "🤝",
      infoNote: "As a business visitor you may attend meetings, conferences and training, but you cannot undertake paid or productive work.",
      fields: [
        { id: "purposeOfVisit",   label: "Purpose of Business Visit", type: "select", required: true, options: ["Meetings / Negotiations","Conference / Seminar","Training","Site Visit","Trade Fair","Other"] },
        { id: "ukCompanyName",    label: "Name of UK Company / Host", type: "text",   required: true, placeholder: "HSBC Bank plc" },
        { id: "ukCompanyAddress", label: "UK Company Address",        type: "text",   required: true, placeholder: "8 Canada Square, Canary Wharf, London", colSpan: "full" },
        { id: "arrivalDate",      label: "Intended Arrival Date",     type: "date",   required: true },
        { id: "departureDate",    label: "Intended Departure Date",   type: "date",   required: true },
        { id: "whoIsPaying",      label: "Who is paying for the visit?", type: "select", required: true, options: ["My Employer","UK Host Company","Self-funded","Other"] },
      ],
    },
    {
      id: "employer",
      title: "Your Employment",
      description: "Your current employment details in your home country",
      icon: "💼",
      fields: [
        { id: "employerName",    label: "Employer Name",            type: "text",   required: true, placeholder: "Tata Consultancy Services" },
        { id: "jobTitle",        label: "Job Title",                type: "text",   required: true, placeholder: "Senior Consultant" },
        { id: "employerAddress", label: "Employer Address",         type: "text",   required: true, colSpan: "full", placeholder: "TCS House, Mumbai" },
        { id: "annualIncome",    label: "Annual Income (USD equiv.)",type: "number", required: true, placeholder: "40000" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Supporting documents for your business visa",
      icon: "📎",
      fields: [
        { id: "passportCopy",     label: "Passport Copy",             type: "file", required: true },
        { id: "photo",            label: "Passport-size Photo",        type: "file", required: true },
        { id: "invitationLetter", label: "Invitation Letter from UK Company", type: "file", required: true },
        { id: "bankStatement",    label: "Bank Statement",             type: "file", required: true },
        { id: "employmentLetter", label: "Employment / Sponsorship Letter", type: "file", required: true },
        { id: "companyRegDocs",   label: "Company Registration Documents", type: "file" },
      ],
    },
  ],
};

// ── Canada Tourist (TRV) ──────────────────────────────────────────────────────
export const caTouristConfig: WizardConfig = {
  visaId: "ca-tourist",
  formLabel: "IMM 5257 TRV",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Personal details for IMM 5257",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Family Name",           type: "text",   required: true },
        { id: "givenName",     label: "Given Name(s)",         type: "text",   required: true },
        { id: "sex",           label: "Sex",                   type: "radio",  required: true, options: ["Male","Female"] },
        { id: "maritalStatus", label: "Marital Status",        type: "select", required: true, options: MARITAL },
        { id: "dob",           label: "Date of Birth",         type: "date",   required: true },
        { id: "cityOfBirth",   label: "City of Birth",         type: "text",   required: true },
        { id: "countryOfBirth",label: "Country of Birth",      type: "select", required: true, options: COUNTRIES },
        { id: "citizenship",   label: "Country of Citizenship",type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email Address",         type: "email",  required: true },
        { id: "phone",         label: "Phone Number",          type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your current travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber",  label: "Passport Number",       type: "text",   required: true },
        { id: "issuingCountry",  label: "Issuing Country",       type: "select", required: true, options: COUNTRIES },
        { id: "issueDate",       label: "Issue Date",            type: "date",   required: true },
        { id: "expiryDate",      label: "Expiry Date",           type: "date",   required: true },
      ],
    },
    {
      id: "travel",
      title: "Visit Details",
      description: "Purpose and details of your visit to Canada",
      icon: "🍁",
      fields: [
        { id: "purposeOfVisit",  label: "Purpose of Visit",      type: "select", required: true, options: ["Tourism","Visiting Family/Friends","Business","Medical","Transit","Other"] },
        { id: "arrivalDate",     label: "Intended Arrival Date", type: "date",   required: true },
        { id: "departureDate",   label: "Intended Departure Date",type: "date",  required: true },
        { id: "canadaAddress",   label: "Address in Canada",     type: "text",   required: true, placeholder: "Hotel or host address", colSpan: "full" },
        { id: "fundingSource",   label: "Source of Funds",       type: "select", required: true, options: ["Personal Savings","Family Sponsor","Employer","Other"] },
        { id: "fundsAvailable",  label: "Funds Available (CAD)", type: "number", required: true, placeholder: "5000" },
      ],
    },
    {
      id: "background",
      title: "Background Questions",
      description: "Immigration and travel history",
      icon: "📋",
      fields: [
        { id: "previousCanada",  label: "Have you been to Canada before?",           type: "radio", required: true, options: YesNo },
        { id: "refusedCanada",   label: "Have you ever been refused a Canadian visa?",type: "radio", required: true, options: YesNo },
        { id: "refusalDetails",  label: "Refusal Details",  type: "textarea", showIf: { field: "refusedCanada", value: "Yes" }, colSpan: "full" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Supporting documents for your TRV application",
      icon: "📎",
      fields: [
        { id: "passportCopy",    label: "Passport Copy",               type: "file", required: true },
        { id: "photo",           label: "Digital Photo (IRCC spec)",   type: "file", required: true },
        { id: "bankStatement",   label: "Bank Statement (last 6 months)", type: "file", required: true },
        { id: "travelHistory",   label: "Previous Travel Documents",    type: "file" },
        { id: "invitationLetter",label: "Invitation Letter (if visiting family)", type: "file" },
      ],
    },
  ],
};

// ── Canada Study Permit ───────────────────────────────────────────────────────
export const caStudentConfig: WizardConfig = {
  visaId: "ca-student",
  formLabel: "Study Permit Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Family Name",       type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",     type: "text",   required: true },
        { id: "sex",          label: "Sex",               type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",          label: "Date of Birth",     type: "date",   required: true },
        { id: "citizenship",  label: "Citizenship",       type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",             type: "email",  required: true },
        { id: "phone",        label: "Phone",             type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true },
        { id: "issuingCountry", label: "Issuing Country",  type: "select", required: true, options: COUNTRIES },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "institution",
      title: "Canadian Institution",
      description: "Details about your designated learning institution (DLI)",
      icon: "🎓",
      infoNote: "You must have a letter of acceptance from a Designated Learning Institution (DLI) in Canada.",
      fields: [
        { id: "institutionName",  label: "Institution Name",        type: "text",   required: true, placeholder: "University of Toronto" },
        { id: "dliNumber",        label: "DLI Number",              type: "text",   required: true, placeholder: "O19395938832" },
        { id: "programName",      label: "Program / Course Name",   type: "text",   required: true, placeholder: "Master of Science in AI" },
        { id: "programLevel",     label: "Program Level",           type: "select", required: true, options: ["Undergraduate","Graduate","Doctoral","Diploma","Certificate","Other"] },
        { id: "startDate",        label: "Program Start Date",      type: "date",   required: true },
        { id: "endDate",          label: "Program End Date",        type: "date",   required: true },
        { id: "tuitionFee",       label: "Annual Tuition Fee (CAD)",type: "number", required: true, placeholder: "25000" },
      ],
    },
    {
      id: "financial",
      title: "Financial Support",
      description: "Evidence of sufficient funds for your studies",
      icon: "💰",
      fields: [
        { id: "fundsAvailable",  label: "Total Funds Available (CAD)", type: "number", required: true, placeholder: "40000" },
        { id: "fundingSource",   label: "Source of Funds",             type: "select", required: true, options: ["Personal/Family Savings","Government Scholarship","University Scholarship","Bank Loan","Other"] },
        { id: "languageTest",    label: "Language Test",               type: "select", required: true, options: ["IELTS","TOEFL","CELPIP","Exempt","Other"] },
        { id: "languageScore",   label: "Overall Score",               type: "text",   required: true, placeholder: "7.0" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Supporting documents for your study permit",
      icon: "📎",
      fields: [
        { id: "passportCopy",     label: "Passport Copy",               type: "file", required: true },
        { id: "photo",            label: "Passport-size Photo",          type: "file", required: true },
        { id: "acceptanceLetter", label: "Letter of Acceptance from DLI",type: "file", required: true },
        { id: "bankStatement",    label: "Bank Statement / Proof of Funds", type: "file", required: true },
        { id: "languageCert",     label: "Language Test Certificate",    type: "file", required: true },
        { id: "medicalResults",   label: "Medical Exam Results (if required)", type: "file" },
        { id: "statementOfPurpose",label: "Statement of Purpose",        type: "file" },
      ],
    },
  ],
};

// ── Canada Work Permit ────────────────────────────────────────────────────────
export const caWorkConfig: WizardConfig = {
  visaId: "ca-work",
  formLabel: "Work Permit Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Family Name",       type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",     type: "text",   required: true },
        { id: "dob",          label: "Date of Birth",     type: "date",   required: true },
        { id: "citizenship",  label: "Citizenship",       type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",             type: "email",  required: true },
        { id: "phone",        label: "Phone",             type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "jobOffer",
      title: "Job Offer Details",
      description: "Your Canadian employer and position details",
      icon: "💼",
      infoNote: "Most work permits require a valid job offer from a Canadian employer and a positive LMIA (Labour Market Impact Assessment).",
      fields: [
        { id: "employerName",    label: "Canadian Employer Name",     type: "text",   required: true },
        { id: "employerAddress", label: "Employer Province / City",   type: "text",   required: true, colSpan: "full" },
        { id: "jobTitle",        label: "Job Title / NOC Code",       type: "text",   required: true, placeholder: "Software Developer — NOC 21232" },
        { id: "startDate",       label: "Employment Start Date",      type: "date",   required: true },
        { id: "salary",          label: "Annual Salary (CAD)",        type: "number", required: true, placeholder: "80000" },
        { id: "lmiaNumber",      label: "LMIA Number (if applicable)",type: "text",   placeholder: "Leave blank if LMIA-exempt" },
        { id: "offerLetter",     label: "Work Permit Category",       type: "select", required: true, options: ["LMIA-based","LMIA-exempt (IEC)","LMIA-exempt (CUSMA/USMCA)","Open Work Permit","Other"] },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Documents to support your work permit application",
      icon: "📎",
      fields: [
        { id: "passportCopy",    label: "Passport Copy",               type: "file", required: true },
        { id: "photo",           label: "Photo",                        type: "file", required: true },
        { id: "jobOfferLetter",  label: "Job Offer Letter",             type: "file", required: true },
        { id: "lmiaDocument",    label: "LMIA Document (if applicable)",type: "file" },
        { id: "resume",          label: "Resume / CV",                  type: "file", required: true },
        { id: "educationCerts",  label: "Educational Certificates",     type: "file" },
      ],
    },
  ],
};

// ── UAE Tourist ───────────────────────────────────────────────────────────────
export const aeTouristConfig: WizardConfig = {
  visaId: "ae-tourist",
  formLabel: "UAE Tourist Visa",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Family Name",           type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",         type: "text",   required: true },
        { id: "sex",          label: "Sex",                   type: "radio",  required: true, options: ["Male","Female"] },
        { id: "maritalStatus",label: "Marital Status",        type: "select", required: true, options: MARITAL },
        { id: "dob",          label: "Date of Birth",         type: "date",   required: true },
        { id: "nationality",  label: "Nationality",           type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",                 type: "email",  required: true },
        { id: "phone",        label: "Phone",                 type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number",  type: "text",   required: true },
        { id: "issueDate",      label: "Issue Date",       type: "date",   required: true },
        { id: "expiryDate",     label: "Expiry Date",      type: "date",   required: true },
      ],
    },
    {
      id: "travel",
      title: "Travel Details",
      description: "Details of your UAE visit",
      icon: "✈️",
      fields: [
        { id: "visaDuration",   label: "Visa Duration",          type: "select", required: true, options: ["30 days single entry","30 days multiple entry","60 days single entry","60 days multiple entry","96-hour transit"] },
        { id: "arrivalDate",    label: "Intended Arrival Date",  type: "date",   required: true },
        { id: "hotelName",      label: "Hotel / Accommodation",  type: "text",   required: true, placeholder: "Burj Al Arab, Dubai" },
        { id: "returnTicket",   label: "Do you have a return ticket?", type: "radio", required: true, options: YesNo },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for your UAE tourist visa",
      icon: "📎",
      fields: [
        { id: "passportCopy",  label: "Passport Copy (valid 6+ months)", type: "file", required: true },
        { id: "photo",         label: "Passport-size Photo (white bg)",  type: "file", required: true },
        { id: "returnFlight",  label: "Return Flight Ticket",             type: "file", required: true },
        { id: "hotelBooking",  label: "Hotel Booking Confirmation",       type: "file", required: true },
        { id: "bankStatement", label: "Bank Statement",                   type: "file" },
      ],
    },
  ],
};

// ── UAE Business Visa ─────────────────────────────────────────────────────────
export const aeBusinessConfig: WizardConfig = {
  visaId: "ae-business",
  formLabel: "UAE Business Visa",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Family Name",    type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",  type: "text",   required: true },
        { id: "sex",          label: "Sex",            type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",          label: "Date of Birth",  type: "date",   required: true },
        { id: "nationality",  label: "Nationality",    type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",          type: "email",  required: true },
        { id: "phone",        label: "Phone",          type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number", type: "text", required: true },
        { id: "expiryDate",     label: "Expiry Date",     type: "date", required: true },
      ],
    },
    {
      id: "business",
      title: "Business Purpose",
      description: "Details of your business visit to UAE",
      icon: "🤝",
      fields: [
        { id: "purposeOfVisit",   label: "Purpose of Visit",           type: "select", required: true, options: ["Business Meeting","Trade Fair / Exhibition","Company Setup","Investment","Conference","Other"] },
        { id: "uaeCompanyName",   label: "UAE Host Company Name",      type: "text",   required: true },
        { id: "arrivalDate",      label: "Intended Arrival",           type: "date",   required: true },
        { id: "departureDate",    label: "Intended Departure",         type: "date",   required: true },
        { id: "sponsoredBy",      label: "Sponsored By",               type: "select", required: true, options: ["UAE Company (employer)","Self / Own Company","Travel Agency","Other"] },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Supporting documents for your business visa",
      icon: "📎",
      fields: [
        { id: "passportCopy",     label: "Passport Copy",              type: "file", required: true },
        { id: "photo",            label: "Photo",                       type: "file", required: true },
        { id: "invitationLetter", label: "Business Invitation Letter", type: "file", required: true },
        { id: "tradeLicense",     label: "Trade License Copy",         type: "file", required: true },
        { id: "bankStatement",    label: "Bank Statement",             type: "file" },
      ],
    },
  ],
};

// ── UAE Employment Visa ───────────────────────────────────────────────────────
export const aeWorkConfig: WizardConfig = {
  visaId: "ae-work",
  formLabel: "UAE Employment Visa",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Family Name",    type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",  type: "text",   required: true },
        { id: "sex",          label: "Sex",            type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",          label: "Date of Birth",  type: "date",   required: true },
        { id: "nationality",  label: "Nationality",    type: "select", required: true, options: COUNTRIES },
        { id: "religion",     label: "Religion",       type: "select", required: true, options: ["Islam","Christianity","Hinduism","Buddhism","Judaism","Other"] },
        { id: "email",        label: "Email",          type: "email",  required: true },
        { id: "phone",        label: "Phone",          type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number", type: "text", required: true },
        { id: "issueDate",      label: "Issue Date",      type: "date", required: true },
        { id: "expiryDate",     label: "Expiry Date",     type: "date", required: true },
      ],
    },
    {
      id: "employer",
      title: "UAE Employer",
      description: "Details about your UAE employer and job offer",
      icon: "🏢",
      infoNote: "Your UAE employer must sponsor your visa. The offer letter must be attested.",
      fields: [
        { id: "employerName",   label: "UAE Employer Name",    type: "text",   required: true },
        { id: "jobTitle",       label: "Job Title",            type: "text",   required: true },
        { id: "monthlySalary",  label: "Monthly Salary (AED)", type: "number", required: true, placeholder: "10000" },
        { id: "emirate",        label: "Emirate",              type: "select", required: true, options: ["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain"] },
        { id: "startDate",      label: "Employment Start Date",type: "date",   required: true },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for UAE employment visa",
      icon: "📎",
      fields: [
        { id: "passportCopy",     label: "Passport Copy",                    type: "file", required: true },
        { id: "photo",            label: "Passport-size Photo (white bg)",   type: "file", required: true },
        { id: "offerLetter",      label: "Employment Offer Letter (attested)",type: "file", required: true },
        { id: "educationCerts",   label: "Educational Certificates (attested)", type: "file", required: true },
        { id: "medicalFitness",   label: "Medical Fitness Certificate",      type: "file", required: true },
        { id: "policeClearance",  label: "Police Clearance Certificate",     type: "file" },
      ],
    },
  ],
};

// ── Germany Schengen Tourist ──────────────────────────────────────────────────
export const deTouristConfig: WizardConfig = {
  visaId: "de-tourist",
  formLabel: "Schengen Visa Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Personal details as per passport",
      icon: "👤",
      fields: [
        { id: "surname",       label: "Surname(s)",            type: "text",   required: true },
        { id: "givenName",     label: "Given Name(s)",         type: "text",   required: true },
        { id: "sex",           label: "Sex",                   type: "radio",  required: true, options: ["Male","Female"] },
        { id: "maritalStatus", label: "Marital Status",        type: "select", required: true, options: MARITAL },
        { id: "dob",           label: "Date of Birth",         type: "date",   required: true },
        { id: "placeOfBirth",  label: "Place of Birth",        type: "text",   required: true },
        { id: "countryOfBirth",label: "Country of Birth",      type: "select", required: true, options: COUNTRIES },
        { id: "nationality",   label: "Current Nationality",   type: "select", required: true, options: COUNTRIES },
        { id: "email",         label: "Email",                 type: "email",  required: true },
        { id: "phone",         label: "Phone",                 type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your current travel document",
      icon: "🛂",
      fields: [
        { id: "passportType",   label: "Passport Type",     type: "select", required: true, options: ["Ordinary","Official","Diplomatic","Other"] },
        { id: "passportNumber", label: "Passport Number",   type: "text",   required: true },
        { id: "issueDate",      label: "Date of Issue",     type: "date",   required: true },
        { id: "expiryDate",     label: "Date of Expiry",    type: "date",   required: true },
        { id: "issuingAuthority",label: "Issuing Authority",type: "text",   required: true, placeholder: "Passport Seva Kendra, Mumbai" },
      ],
    },
    {
      id: "travel",
      title: "Travel Information",
      description: "Details about your visit to the Schengen Area",
      icon: "✈️",
      infoNote: "Germany Schengen visa allows travel across all 26 Schengen countries. You may stay up to 90 days in any 180-day period.",
      fields: [
        { id: "purposeOfJourney", label: "Purpose of Journey",      type: "select", required: true, options: ["Tourism","Business","Visiting Family/Friends","Cultural / Sports","Medical","Transit","Other"] },
        { id: "mainDestination",  label: "Main Destination Country", type: "text",   required: true, placeholder: "Germany" },
        { id: "firstEntryCountry",label: "Country of First Entry",  type: "text",   required: true, placeholder: "Germany" },
        { id: "numberOfEntries",  label: "Number of Entries",       type: "select", required: true, options: ["Single","Double","Multiple"] },
        { id: "arrivalDate",      label: "Intended Date of Arrival",type: "date",   required: true },
        { id: "departureDate",    label: "Intended Date of Departure",type:"date",  required: true },
        { id: "accommodationName",label: "Accommodation Name",      type: "text",   required: true, placeholder: "Ibis Hotel Berlin" },
        { id: "accommodationAddress",label:"Accommodation Address", type: "text",   required: true, colSpan: "full" },
      ],
    },
    {
      id: "financial",
      title: "Financial Means",
      description: "How you will finance your stay",
      icon: "💶",
      fields: [
        { id: "financedBy",       label: "Journey Financed By",     type: "select", required: true, options: ["Own Funds","Sponsor / Host","Employer","Other"] },
        { id: "fundsAvailable",   label: "Funds Available (EUR)",   type: "number", required: true, placeholder: "2000" },
        { id: "travelInsurance",  label: "Do you have Schengen travel insurance (min €30,000)?", type: "radio", required: true, options: YesNo },
        { id: "insuranceProvider",label: "Insurance Provider",      type: "text",   showIf: { field: "travelInsurance", value: "Yes" }, placeholder: "AXA / Allianz" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for your Schengen visa",
      icon: "📎",
      infoNote: "Documents must be in English or German. Official translations required otherwise.",
      fields: [
        { id: "passportCopy",     label: "Passport Copy (all pages)", type: "file", required: true },
        { id: "photo",            label: "Photo (35×45mm, white bg)", type: "file", required: true },
        { id: "travelInsuranceCert",label:"Travel Insurance Certificate", type: "file", required: true },
        { id: "flightItinerary",  label: "Round-trip Flight Itinerary",type: "file", required: true },
        { id: "hotelBookings",    label: "Hotel Bookings",             type: "file", required: true },
        { id: "bankStatement",    label: "Bank Statement (last 3 months)", type: "file", required: true },
        { id: "employmentProof",  label: "Employment Proof (NOC / Leave Letter)", type: "file", required: true },
        { id: "itr",              label: "Income Tax Returns (last 2 years)", type: "file" },
      ],
    },
  ],
};

// ── Germany Student Visa (National D) ────────────────────────────────────────
export const deStudentConfig: WizardConfig = {
  visaId: "de-student",
  formLabel: "German Student Visa",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Surname(s)",       type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",    type: "text",   required: true },
        { id: "sex",          label: "Sex",              type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",          label: "Date of Birth",   type: "date",   required: true },
        { id: "nationality",  label: "Nationality",      type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",            type: "email",  required: true },
        { id: "phone",        label: "Phone",            type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number", type: "text", required: true },
        { id: "issueDate",      label: "Issue Date",      type: "date", required: true },
        { id: "expiryDate",     label: "Expiry Date",     type: "date", required: true },
      ],
    },
    {
      id: "university",
      title: "University & Programme",
      description: "Details of your studies in Germany",
      icon: "🎓",
      infoNote: "You must have an unconditional offer (Zulassung) from a German university before applying.",
      fields: [
        { id: "universityName",   label: "University Name",           type: "text",   required: true, placeholder: "Technische Universität München" },
        { id: "programName",      label: "Programme / Degree",        type: "text",   required: true, placeholder: "M.Sc. Informatics" },
        { id: "programLanguage",  label: "Language of Instruction",   type: "select", required: true, options: ["German","English","Both"] },
        { id: "startDate",        label: "Programme Start Date",      type: "date",   required: true },
        { id: "endDate",          label: "Programme End Date",        type: "date",   required: true },
        { id: "tuitionFee",       label: "Semester Fee / Tuition (EUR)", type: "number", required: true, placeholder: "200" },
      ],
    },
    {
      id: "financial",
      title: "Financial Proof",
      description: "Evidence of sufficient funds for your stay in Germany",
      icon: "💶",
      infoNote: "You must show at least €10,332 per year (or a blocked account / scholarship covering this amount).",
      fields: [
        { id: "financingMethod",  label: "Financing Method",          type: "select", required: true, options: ["Blocked Account (Sperrkonto)","Scholarship (DAAD / Government)","Self / Family Funds","Sponsorship Letter","Other"] },
        { id: "amountAvailable",  label: "Amount Available (EUR)",    type: "number", required: true, placeholder: "11000" },
        { id: "healthInsurance",  label: "Do you have German health insurance?", type: "radio", required: true, options: YesNo },
        { id: "insuranceProvider",label: "Insurance Provider",        type: "text",   showIf: { field: "healthInsurance", value: "Yes" }, placeholder: "TK / AOK / Barmer" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for your German student visa",
      icon: "📎",
      fields: [
        { id: "passportCopy",      label: "Passport Copy",                   type: "file", required: true },
        { id: "photo",             label: "Biometric Photo",                  type: "file", required: true },
        { id: "admissionLetter",   label: "University Admission Letter (Zulassung)", type: "file", required: true },
        { id: "blockedAccount",    label: "Blocked Account / Scholarship Proof", type: "file", required: true },
        { id: "healthInsuranceCert",label:"Health Insurance Certificate",    type: "file", required: true },
        { id: "motivationLetter",  label: "Motivation / Cover Letter",       type: "file", required: true },
        { id: "academicTranscripts",label:"Academic Transcripts",            type: "file" },
        { id: "languageCert",      label: "German / English Language Certificate", type: "file" },
      ],
    },
  ],
};

// ── Germany EU Blue Card (Work) ───────────────────────────────────────────────
export const deWorkConfig: WizardConfig = {
  visaId: "de-work",
  formLabel: "EU Blue Card Application",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Your personal details",
      icon: "👤",
      fields: [
        { id: "surname",      label: "Surname(s)",      type: "text",   required: true },
        { id: "givenName",    label: "Given Name(s)",   type: "text",   required: true },
        { id: "sex",          label: "Sex",             type: "radio",  required: true, options: ["Male","Female"] },
        { id: "dob",          label: "Date of Birth",  type: "date",   required: true },
        { id: "nationality",  label: "Nationality",     type: "select", required: true, options: COUNTRIES },
        { id: "email",        label: "Email",           type: "email",  required: true },
        { id: "phone",        label: "Phone",           type: "tel",    required: true },
      ],
    },
    {
      id: "passport",
      title: "Passport Details",
      description: "Your travel document",
      icon: "🛂",
      fields: [
        { id: "passportNumber", label: "Passport Number", type: "text", required: true },
        { id: "expiryDate",     label: "Expiry Date",     type: "date", required: true },
      ],
    },
    {
      id: "employment",
      title: "German Employment",
      description: "Details of your job offer in Germany",
      icon: "💼",
      infoNote: "EU Blue Card requires a recognized university degree AND an employment contract with salary ≥ €45,300/year (€41,041 for shortage occupations).",
      fields: [
        { id: "employerName",    label: "German Employer Name",    type: "text",   required: true },
        { id: "jobTitle",        label: "Job Title",               type: "text",   required: true },
        { id: "annualSalary",    label: "Annual Gross Salary (EUR)", type: "number", required: true, placeholder: "60000" },
        { id: "startDate",       label: "Start Date",              type: "date",   required: true },
        { id: "city",            label: "City / State in Germany", type: "text",   required: true, placeholder: "Munich, Bavaria" },
        { id: "isShortageOccupation",label:"Is this a shortage occupation (MINT / Healthcare)?", type: "radio", required: true, options: YesNo },
      ],
    },
    {
      id: "qualifications",
      title: "Qualifications",
      description: "Your educational and professional background",
      icon: "🎓",
      fields: [
        { id: "degreeTitle",      label: "Degree Title",            type: "text",   required: true, placeholder: "Bachelor of Engineering" },
        { id: "fieldOfStudy",     label: "Field of Study",          type: "text",   required: true, placeholder: "Mechanical Engineering" },
        { id: "university",       label: "University / Institution",type: "text",   required: true },
        { id: "degreeRecognized", label: "Degree Recognized in Germany / EU?", type: "radio", required: true, options: YesNo },
        { id: "anabin",           label: "Anabin / KMK Recognition Reference (if applicable)", type: "text", placeholder: "H+ / H / H-" },
      ],
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Required documents for your EU Blue Card",
      icon: "📎",
      fields: [
        { id: "passportCopy",       label: "Passport Copy",                   type: "file", required: true },
        { id: "photo",              label: "Biometric Photo",                  type: "file", required: true },
        { id: "employmentContract", label: "Employment Contract",              type: "file", required: true },
        { id: "degreeCertificate",  label: "Degree Certificate",               type: "file", required: true },
        { id: "degreeTranscript",   label: "Academic Transcripts",             type: "file", required: true },
        { id: "degreeRecognition",  label: "Degree Recognition Certificate (anabin)", type: "file" },
        { id: "healthInsurance",    label: "Health Insurance Proof",           type: "file", required: true },
        { id: "cv",                 label: "CV / Resume",                      type: "file" },
      ],
    },
  ],
};

// ── MASTER MAP: visaId → WizardConfig ─────────────────────────────────────────
export const VISA_FORM_CONFIGS: Record<string, WizardConfig> = {
  "us-tourist":  usTouristConfig,
  "us-work":     usWorkConfig,
  "gb-tourist":  gbTouristConfig,
  "gb-student":  gbStudentConfig,
  "gb-business": gbBusinessConfig,
  "ca-tourist":  caTouristConfig,
  "ca-student":  caStudentConfig,
  "ca-work":     caWorkConfig,
  "ae-tourist":  aeTouristConfig,
  "ae-business": aeBusinessConfig,
  "ae-work":     aeWorkConfig,
  "de-tourist":  deTouristConfig,
  "de-student":  deStudentConfig,
  "de-work":     deWorkConfig,
};
