import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateFormBuilderConfig } from "@/lib/form-builder-validation";
import type { StoredCountry, StoredVisa } from "@/lib/admin-content-types";
import type { Country, VisaType } from "@/types";
import type { WizardConfig, WizardField, WizardSection } from "@/components/form/GenericWizard";

const COUNTRIES_KEY = "admin_catalog_countries";
const VISAS_KEY = "admin_catalog_visas";
const FORM_CONFIGS_KEY = "admin_form_configs";
const FORM_DEFAULTS_KEY = "admin_form_config_defaults";

export type PublishedCountry = Country & { source: "static" | "custom" };
export type PublishedVisa = VisaType & { source: "static" | "custom" };
type LegacySlugInput = { slug?: unknown };

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCountry(input: Partial<StoredCountry | Country> & LegacySlugInput): Country {
  const code = String(input.code ?? "").trim().toUpperCase();
  const idFromSlug = typeof input.slug === "string" ? input.slug.trim() : "";
  const idBase = String(input.id ?? idFromSlug).trim();

  return {
    id: idBase || code.toLowerCase(),
    name: String(input.name ?? "").trim(),
    code,
    flag: String(input.flag ?? "").trim(),
    description: String(input.description ?? "").trim(),
    continent: String(input.continent ?? "").trim(),
  };
}

function normalizeVisa(input: Partial<StoredVisa | VisaType> & LegacySlugInput): VisaType {
  const rawDocs = Array.isArray(input.documentsRequired) ? input.documentsRequired : [];
  const docs = rawDocs.map((doc) => String(doc).trim()).filter(Boolean);
  const category = String(input.category ?? "tourist").trim().toLowerCase() || "tourist";
  const idFromSlug = typeof input.slug === "string" ? input.slug.trim() : "";
  const id = String(input.id ?? idFromSlug).trim();

  return {
    id,
    countryCode: String(input.countryCode ?? "").trim().toUpperCase(),
    name: String(input.name ?? "").trim(),
    category,
    processingTime: String(input.processingTime ?? "2-4 weeks").trim(),
    validity: String(input.validity ?? "Single entry").trim(),
    stayDuration: String(input.stayDuration ?? "30 days").trim(),
    fee: Number(input.fee ?? 0),
    documentsRequired: docs,
    formSchemaId: String(input.formSchemaId ?? id).trim() || id || "tourist",
    description: String(input.description ?? "").trim(),
  };
}

function toStoredCountry(
  input: Partial<StoredCountry | Country>,
  source: "static" | "custom",
): StoredCountry {
  const normalized = normalizeCountry(input);
  return {
    id: normalized.id,
    name: normalized.name,
    code: normalized.code,
    flag: normalized.flag,
    description: normalized.description ?? "",
    continent: normalized.continent ?? "",
    source,
  };
}

function toStoredVisa(input: Partial<StoredVisa | VisaType>, source: "static" | "custom"): StoredVisa {
  const normalized = normalizeVisa(input);
  return {
    id: normalized.id,
    name: normalized.name,
    countryCode: normalized.countryCode,
    category: normalized.category,
    fee: normalized.fee,
    processingTime: normalized.processingTime,
    validity: normalized.validity,
    stayDuration: normalized.stayDuration,
    description: normalized.description ?? "",
    documentsRequired: normalized.documentsRequired,
    formSchemaId: normalized.formSchemaId,
    source,
  };
}

function normalizeStoredCountryRecord(value: unknown): StoredCountry | null {
  if (!isObjectRecord(value)) return null;
  return toStoredCountry(
    value as Partial<StoredCountry | Country> & LegacySlugInput,
    value.source === "custom" ? "custom" : "static",
  );
}

function normalizeStoredVisaRecord(value: unknown): StoredVisa | null {
  if (!isObjectRecord(value)) return null;
  const normalized = toStoredVisa(
    value as Partial<StoredVisa | VisaType> & LegacySlugInput,
    value.source === "custom" ? "custom" : "static",
  );
  // Drop malformed legacy rows that still cannot produce a stable id.
  if (!normalized.id) return null;
  return normalized;
}

async function saveConfigValue(key: string, value: Prisma.InputJsonValue): Promise<void> {
  await prisma.adminConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function getStoredCountries(): Promise<StoredCountry[]> {
  const cfg = await prisma.adminConfig.findUnique({ where: { key: COUNTRIES_KEY } });
  if (!Array.isArray(cfg?.value)) return [];
  return cfg.value
    .map((country) => normalizeStoredCountryRecord(country))
    .filter((country): country is StoredCountry => Boolean(country));
}

async function getStoredVisas(): Promise<StoredVisa[]> {
  const cfg = await prisma.adminConfig.findUnique({ where: { key: VISAS_KEY } });
  if (!Array.isArray(cfg?.value)) return [];
  return cfg.value
    .map((visa) => normalizeStoredVisaRecord(visa))
    .filter((visa): visa is StoredVisa => Boolean(visa));
}

async function saveStoredCountries(countries: StoredCountry[]): Promise<void> {
  await saveConfigValue(COUNTRIES_KEY, countries as unknown as Prisma.InputJsonValue);
}

async function saveStoredVisas(visas: StoredVisa[]): Promise<void> {
  await saveConfigValue(VISAS_KEY, visas as unknown as Prisma.InputJsonValue);
}

export async function getPublishedCountries(): Promise<PublishedCountry[]> {
  const countries = await getStoredCountries();
  return countries.map((country) => ({
    ...normalizeCountry(country),
    source: country.source === "custom" ? "custom" : "static",
  }));
}

export async function getPublishedVisas(): Promise<PublishedVisa[]> {
  const visas = await getStoredVisas();
  return visas.map((visa) => ({
    ...normalizeVisa(visa),
    source: visa.source === "custom" ? "custom" : "static",
  }));
}

export async function getPublishedCatalog(): Promise<{
  countries: PublishedCountry[];
  visas: PublishedVisa[];
}> {
  const [countries, visas] = await Promise.all([getPublishedCountries(), getPublishedVisas()]);
  return { countries, visas };
}

export async function getPublishedCountryByCode(code: string): Promise<PublishedCountry | null> {
  const countries = await getPublishedCountries();
  const normalized = code.trim().toUpperCase();
  return countries.find((country) => country.code === normalized) ?? null;
}

export async function getPublishedVisaById(id: string): Promise<PublishedVisa | null> {
  const visas = await getPublishedVisas();
  return visas.find((visa) => visa.id === id) ?? null;
}

export async function listAdminCountries(): Promise<Array<PublishedCountry & {
  visaCount: number;
  visas: Array<Pick<PublishedVisa, "id" | "name" | "category" | "fee">>;
}>> {
  const [countries, visas] = await Promise.all([getPublishedCountries(), getPublishedVisas()]);

  return countries.map((country) => {
    const relatedVisas = visas
      .filter((visa) => visa.countryCode === country.code)
      .map((visa) => ({
        id: visa.id,
        name: visa.name,
        category: visa.category,
        fee: visa.fee,
      }));

    return {
      ...country,
      visaCount: relatedVisas.length,
      visas: relatedVisas,
    };
  });
}

export async function getAdminCountryById(id: string): Promise<
  | (PublishedCountry & {
      visaCount: number;
      visas: Array<Pick<PublishedVisa, "id" | "name" | "category" | "fee">>;
    })
  | null
> {
  const normalizedId = id.trim().toLowerCase();
  const countries = await listAdminCountries();
  return (
    countries.find(
      (country) => country.id.toLowerCase() === normalizedId || country.code.toLowerCase() === normalizedId,
    ) ?? null
  );
}

export async function createAdminCountry(input: Partial<StoredCountry>): Promise<StoredCountry> {
  const countries = await getStoredCountries();
  const newCountry = toStoredCountry(input, "custom");

  if (!newCountry.name || !newCountry.code || !newCountry.flag) {
    throw new Error("name, code, and flag are required");
  }

  if (
    countries.some(
      (country) =>
        country.code.toUpperCase() === newCountry.code.toUpperCase() ||
        country.id.toLowerCase() === newCountry.id.toLowerCase(),
    )
  ) {
    throw new Error("Country code already exists");
  }

  const nextCountries = [...countries, newCountry];
  await saveStoredCountries(nextCountries);
  return newCountry;
}

export async function updateAdminCountry(
  id: string,
  updates: Partial<StoredCountry>,
): Promise<StoredCountry | null> {
  const countries = await getStoredCountries();
  const normalizedId = id.trim().toLowerCase();
  const index = countries.findIndex(
    (country) => country.id.toLowerCase() === normalizedId || country.code.toLowerCase() === normalizedId,
  );

  if (index === -1) return null;

  const current = countries[index];
  const nextCountry: StoredCountry = {
    ...current,
    ...toStoredCountry(
      {
        ...current,
        ...updates,
        code: current.code,
        id: current.id,
      },
      current.source === "custom" ? "custom" : "static",
    ),
    source: current.source === "custom" ? "custom" : "static",
  };

  countries[index] = nextCountry;
  await saveStoredCountries(countries);
  return nextCountry;
}

export async function deleteAdminCountry(id: string): Promise<boolean> {
  const countries = await getStoredCountries();
  const normalizedId = id.trim().toLowerCase();
  const index = countries.findIndex(
    (country) => country.id.toLowerCase() === normalizedId || country.code.toLowerCase() === normalizedId,
  );

  if (index === -1) return false;
  if (countries[index].source !== "custom") {
    throw new Error("Cannot delete built-in countries. You can edit them instead.");
  }

  countries.splice(index, 1);
  await saveStoredCountries(countries);
  return true;
}

export async function listAdminVisas(filters?: {
  search?: string | null;
  category?: string | null;
  country?: string | null;
}): Promise<{
  visas: PublishedVisa[];
  total: number;
  categories: string[];
  countries: string[];
}> {
  const allVisas = await getPublishedVisas();
  const search = filters?.search?.toLowerCase().trim();
  const category = filters?.category?.trim();
  const country = filters?.country?.trim().toUpperCase();

  let results = allVisas;
  if (category && category !== "all") {
    results = results.filter((visa) => visa.category === category);
  }
  if (country && country !== "all") {
    results = results.filter((visa) => visa.countryCode === country);
  }
  if (search) {
    results = results.filter(
      (visa) =>
        visa.name.toLowerCase().includes(search) ||
        visa.countryCode.toLowerCase().includes(search) ||
        visa.category.toLowerCase().includes(search),
    );
  }

  return {
    visas: results,
    total: results.length,
    categories: Array.from(new Set(allVisas.map((visa) => visa.category))),
    countries: Array.from(new Set(allVisas.map((visa) => visa.countryCode))),
  };
}

export async function getAdminVisaById(id: string): Promise<PublishedVisa | null> {
  return getPublishedVisaById(id);
}

export async function createAdminVisa(input: Partial<StoredVisa>): Promise<StoredVisa> {
  const visas = await getStoredVisas();
  const newVisa = toStoredVisa(
    {
      ...input,
      id: String(input.id ?? `custom-${String(input.countryCode ?? "").toLowerCase()}-${Date.now()}`),
    },
    "custom",
  );

  if (!newVisa.name || !newVisa.countryCode || !newVisa.category) {
    throw new Error("name, countryCode, and category are required");
  }

  if (visas.some((visa) => visa.id === newVisa.id)) {
    throw new Error("Visa id already exists");
  }

  const nextVisas = [...visas, newVisa];
  await saveStoredVisas(nextVisas);
  return newVisa;
}

export async function updateAdminVisa(
  id: string,
  updates: Partial<StoredVisa>,
): Promise<StoredVisa | null> {
  const visas = await getStoredVisas();
  const index = visas.findIndex((visa) => visa.id === id);
  if (index === -1) return null;

  const current = visas[index];
  const nextVisa: StoredVisa = {
    ...current,
    ...toStoredVisa(
      {
        ...current,
        ...updates,
        id: current.id,
      },
      current.source === "custom" ? "custom" : "static",
    ),
    source: current.source === "custom" ? "custom" : "static",
  };

  visas[index] = nextVisa;
  await saveStoredVisas(visas);
  return nextVisa;
}

export async function deleteAdminVisa(id: string): Promise<boolean> {
  const visas = await getStoredVisas();
  const index = visas.findIndex((visa) => visa.id === id);
  if (index === -1) return false;
  if (visas[index].source !== "custom") {
    throw new Error("Cannot delete built-in visa types. Edit them instead.");
  }

  visas.splice(index, 1);
  await saveStoredVisas(visas);
  return true;
}

function normalizeWizardField(value: unknown): WizardField | null {
  if (!isObjectRecord(value)) return null;

  const type = String(value.type ?? "").trim();
  const id = String(value.id ?? "").trim();
  const label = String(value.label ?? "").trim();
  if (!type || !id || !label) return null;

  const normalized: WizardField = {
    id,
    label,
    type: type as WizardField["type"],
  };

  if (typeof value.required === "boolean") normalized.required = value.required;
  if (typeof value.placeholder === "string") normalized.placeholder = value.placeholder.trim();
  if (Array.isArray(value.options)) {
    normalized.options = value.options.map((option) => String(option).trim()).filter(Boolean);
  }
  if (
    isObjectRecord(value.showIf) &&
    typeof value.showIf.field === "string" &&
    typeof value.showIf.value === "string"
  ) {
    normalized.showIf = {
      field: value.showIf.field.trim(),
      value: value.showIf.value.trim(),
    };
  }
  if (value.colSpan === "full") normalized.colSpan = "full";

  return normalized;
}

function normalizeWizardSection(value: unknown): WizardSection | null {
  if (!isObjectRecord(value)) return null;

  const id = String(value.id ?? "").trim();
  const title = String(value.title ?? "").trim();
  if (!id || !title) return null;

  const rawFields = Array.isArray(value.fields) ? value.fields : [];
  const fields = rawFields
    .map((field) => normalizeWizardField(field))
    .filter((field): field is WizardField => Boolean(field));

  return {
    id,
    title,
    description: String(value.description ?? "").trim(),
    icon: String(value.icon ?? "Form").trim() || "Form",
    heading: typeof value.heading === "string" ? value.heading.trim() : undefined,
    infoNote: typeof value.infoNote === "string" ? value.infoNote.trim() : undefined,
    fields,
  };
}

function normalizeWizardConfig(value: unknown, fallbackVisaId?: string): WizardConfig | null {
  if (!isObjectRecord(value)) return null;

  const visaId = String(value.visaId ?? fallbackVisaId ?? "").trim();
  const formLabel = String(value.formLabel ?? "").trim();
  if (!visaId || !formLabel) return null;

  const rawSections = Array.isArray(value.sections) ? value.sections : [];
  const sections = rawSections
    .map((section) => normalizeWizardSection(section))
    .filter((section): section is WizardSection => Boolean(section));

  return {
    visaId,
    formLabel,
    sections,
  };
}

function parseWizardConfigMap(value: unknown): Record<string, WizardConfig> {
  if (!isObjectRecord(value)) return {};

  const configs: Record<string, WizardConfig> = {};
  for (const [visaId, config] of Object.entries(value)) {
    const normalized = normalizeWizardConfig(config, visaId);
    if (!normalized) continue;
    configs[visaId] = normalized;
  }
  return configs;
}

function configFingerprint(config: WizardConfig | undefined): string {
  return JSON.stringify(config ?? null);
}

async function getStoredFormConfigMaps(): Promise<{
  published: Record<string, WizardConfig>;
  defaults: Record<string, WizardConfig>;
}> {
  const [publishedRecord, defaultsRecord] = await Promise.all([
    prisma.adminConfig.findUnique({ where: { key: FORM_CONFIGS_KEY } }),
    prisma.adminConfig.findUnique({ where: { key: FORM_DEFAULTS_KEY } }),
  ]);

  return {
    published: parseWizardConfigMap(publishedRecord?.value),
    defaults: parseWizardConfigMap(defaultsRecord?.value),
  };
}

async function savePublishedFormConfigs(configs: Record<string, WizardConfig>): Promise<void> {
  await saveConfigValue(FORM_CONFIGS_KEY, configs as unknown as Prisma.InputJsonValue);
}

export async function getPublishedFormConfig(visaId: string): Promise<WizardConfig | null> {
  const { published } = await getStoredFormConfigMaps();
  return published[visaId] ?? null;
}

export async function getPublishedFormConfigs(): Promise<Array<WizardConfig & { hasOverride: boolean }>> {
  const { published, defaults } = await getStoredFormConfigMaps();

  return Object.values(published)
    .sort((left, right) => left.visaId.localeCompare(right.visaId))
    .map((config) => ({
      ...config,
      hasOverride: configFingerprint(config) !== configFingerprint(defaults[config.visaId]),
    }));
}

export async function saveFormOverride(config: WizardConfig): Promise<WizardConfig> {
  const validation = validateFormBuilderConfig(config);
  if (!validation.valid) {
    throw new Error(validation.issues[0] ?? "Invalid form config payload");
  }

  const normalized = normalizeWizardConfig(config);
  if (!normalized) {
    throw new Error("Invalid form config payload");
  }

  // Write to AdminConfig blob (existing fast path used by apply page)
  const { published } = await getStoredFormConfigMaps();
  published[normalized.visaId] = normalized;
  await savePublishedFormConfigs(published);

  // Sync to the proper VisaFormConfig Prisma model so both sources stay consistent.
  // The apply page reads from AdminConfig, but VisaFormConfig is the source of truth
  // for seed-time defaults and future migrations.
  await prisma.visaFormConfig.upsert({
    where: { schemaId: normalized.visaId },
    update: {
      formLabel: normalized.formLabel,
      sections: normalized.sections as unknown as Prisma.InputJsonValue,
      isDefault: false,
    },
    create: {
      schemaId: normalized.visaId,
      formLabel: normalized.formLabel,
      sections: normalized.sections as unknown as Prisma.InputJsonValue,
      isDefault: false,
    },
  });

  return normalized;
}

export async function resetFormOverride(visaId: string): Promise<void> {
  const { published, defaults } = await getStoredFormConfigMaps();

  if (defaults[visaId]) {
    published[visaId] = defaults[visaId];
  } else {
    delete published[visaId];
  }

  await savePublishedFormConfigs(published);
}
