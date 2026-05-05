import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VISA_FORM_CONFIGS } from "../src/lib/visaFormConfigs";
import { DEFAULT_SITE_CONTENT } from "../src/lib/site-content-defaults";

// ─── Types ────────────────────────────────────────────────────────────────────

type VisaCategory =
  | "tourist"
  | "business"
  | "student"
  | "work"
  | "transit"
  | "medical"
  | "family"
  | "other";

interface SeedCountry {
  slug: string;
  code: string;
  name: string;
  flag: string;
  description: string;
  continent: string;
}

interface SeedVisa {
  slug: string;
  countryCode: string;
  name: string;
  category: VisaCategory;
  fee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  formSchemaId: string;
  documentsRequired: string[];
}

interface SeedSupplier {
  name: string;
  email: string;
  type: string;
  priceMultiplier: number;
  description: string;
  isVerified: boolean;
  isActive: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_COUNTRIES: SeedCountry[] = [
  { slug: "us", code: "US", name: "United States", flag: "🇺🇸", description: "The United States of America", continent: "North America" },
  { slug: "gb", code: "GB", name: "United Kingdom", flag: "🇬🇧", description: "Great Britain and Northern Ireland", continent: "Europe" },
  { slug: "ca", code: "CA", name: "Canada", flag: "🇨🇦", description: "Canada", continent: "North America" },
  { slug: "ae", code: "AE", name: "United Arab Emirates", flag: "🇦🇪", description: "UAE", continent: "Asia" },
  { slug: "de", code: "DE", name: "Germany", flag: "🇩🇪", description: "Federal Republic of Germany", continent: "Europe" },
];

const SEED_VISAS: SeedVisa[] = [
  { slug: "us-tourist", countryCode: "US", name: "B-1/B-2 Tourist Visa", category: "tourist", fee: 160, processingTime: "3-5 weeks", validity: "10 years", stayDuration: "180 days", formSchemaId: "us-tourist", documentsRequired: ["Passport", "Photo", "DS-160 Form", "Bank Statement"] },
  { slug: "us-work", countryCode: "US", name: "H-1B Work Visa", category: "work", fee: 460, processingTime: "3-6 months", validity: "3 years", stayDuration: "3 years", formSchemaId: "us-work", documentsRequired: ["Passport", "Photo", "Job Offer Letter", "LCA"] },
  { slug: "gb-tourist", countryCode: "GB", name: "Standard Visitor Visa", category: "tourist", fee: 115, processingTime: "3 weeks", validity: "6 months", stayDuration: "6 months", formSchemaId: "gb-tourist", documentsRequired: ["Passport", "Photo", "Bank Statement", "Hotel Booking"] },
  { slug: "gb-student", countryCode: "GB", name: "UK Student Visa", category: "student", fee: 363, processingTime: "3 weeks", validity: "Course duration", stayDuration: "Course duration", formSchemaId: "gb-student", documentsRequired: ["Passport", "CAS Letter", "IELTS", "Bank Statement"] },
  { slug: "gb-business", countryCode: "GB", name: "UK Business Visitor Visa", category: "business", fee: 115, processingTime: "3 weeks", validity: "6 months", stayDuration: "6 months", formSchemaId: "gb-business", documentsRequired: ["Passport", "Invitation Letter", "Business Registration"] },
  { slug: "ca-tourist", countryCode: "CA", name: "Canada Visitor Visa", category: "tourist", fee: 100, processingTime: "4-8 weeks", validity: "Up to 10 years", stayDuration: "6 months", formSchemaId: "ca-tourist", documentsRequired: ["Passport", "Photo", "Bank Statement", "Travel History"] },
  { slug: "ca-student", countryCode: "CA", name: "Canada Study Permit", category: "student", fee: 150, processingTime: "8-12 weeks", validity: "Study period", stayDuration: "Study period", formSchemaId: "ca-student", documentsRequired: ["Passport", "Acceptance Letter", "Financial Proof"] },
  { slug: "ca-work", countryCode: "CA", name: "Canada Work Permit", category: "work", fee: 155, processingTime: "8-16 weeks", validity: "Job offer term", stayDuration: "Job offer term", formSchemaId: "ca-work", documentsRequired: ["Passport", "LMIA", "Job Offer", "Qualifications"] },
  { slug: "ae-tourist", countryCode: "AE", name: "UAE Tourist Visa", category: "tourist", fee: 95, processingTime: "3-5 days", validity: "30 days", stayDuration: "30 days", formSchemaId: "ae-tourist", documentsRequired: ["Passport", "Photo", "Hotel Booking", "Return Ticket"] },
  { slug: "ae-business", countryCode: "AE", name: "UAE Business Visa", category: "business", fee: 140, processingTime: "3-5 days", validity: "30 days", stayDuration: "30 days", formSchemaId: "ae-business", documentsRequired: ["Passport", "Invitation Letter", "Company Registration"] },
  { slug: "ae-work", countryCode: "AE", name: "UAE Employment Visa", category: "work", fee: 220, processingTime: "2-4 weeks", validity: "2 years", stayDuration: "2 years", formSchemaId: "ae-work", documentsRequired: ["Passport", "Employment Contract", "Medical Certificate"] },
  { slug: "de-tourist", countryCode: "DE", name: "Germany Schengen Visa", category: "tourist", fee: 80, processingTime: "2-3 weeks", validity: "90 days", stayDuration: "90 days", formSchemaId: "de-tourist", documentsRequired: ["Passport", "Photo", "Travel Insurance", "Hotel Booking"] },
  { slug: "de-student", countryCode: "DE", name: "Germany Student Visa", category: "student", fee: 75, processingTime: "6-8 weeks", validity: "Course duration", stayDuration: "Course duration", formSchemaId: "de-student", documentsRequired: ["Passport", "Admission Letter", "Financial Proof", "Health Insurance"] },
  { slug: "de-work", countryCode: "DE", name: "Germany Work Visa", category: "work", fee: 75, processingTime: "4-8 weeks", validity: "Job duration", stayDuration: "Job duration", formSchemaId: "de-work", documentsRequired: ["Passport", "Job Contract", "Qualifications", "Language Certificate"] },
];

const SEED_SUPPLIERS: SeedSupplier[] = [
  {
    name: "VisaHub Official",
    email: "official@visahub.com",
    type: "embassy",
    priceMultiplier: 1.0,
    description: "Apply directly through official government channels.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "QuickVisa Agents",
    email: "agent@quickvisa.com",
    type: "agency",
    priceMultiplier: 1.15,
    description: "Professional visa agency with guided document review.",
    isVerified: true,
    isActive: true,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;
const TX_TIMEOUT_MS = 60_000;

// ─── Client ───────────────────────────────────────────────────────────────────

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("warn", (e) => console.warn(`[prisma:warn]  ${e.message}`));
prisma.$on("error", (e) => console.error(`[prisma:error] ${e.message}`));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function elapsed(start: number): string {
  return `${((Date.now() - start) / 1000).toFixed(2)}s`;
}

/** UTC date — avoids timezone-offset misparse in Prisma + MongoDB */
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Guard: abort if DATABASE_URL points to a known production host pattern.
 * Supplements NODE_ENV check — env vars are easy to misconfigure.
 */
function assertNotProduction(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("🚫 Seed refused: NODE_ENV=production");
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  const PROD_PATTERNS = [/prod[^.]*\.mongodb\.net/i, /live[^.]*\.mongodb\.net/i, /release[^.]*\.mongodb\.net/i, /\bprod\b/i, /\blive\b/i, /\brelease\b/i];
  for (const pattern of PROD_PATTERNS) {
    if (pattern.test(dbUrl)) {
      throw new Error(
        `🚫 Seed refused: DATABASE_URL matches production pattern /${pattern.source}/.\n` +
        "   Point DATABASE_URL at a local or dev cluster."
      );
    }
  }
}

/** Resolve required env var or throw with a helpful message. */
function requireEnv(key: string, hint?: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(
      `Missing required env var: ${key}${hint ? `\n  Hint: ${hint}` : ""}`
    );
  }
  return val;
}

async function tryRawCommand(
  command: Prisma.InputJsonObject,
  label: string
): Promise<void> {
  try {
    await prisma.$runCommandRaw(command);
  } catch (err) {
    console.warn(`  ⚠ ${label} failed (non-fatal): ${(err as Error).message}`);
  }
}

// ─── Step functions ───────────────────────────────────────────────────────────

async function seedUsers(adminHash: string, demoHash?: string): Promise<void> {
  console.log("── Step 1/4: Users ────────────────────────");

  const admin = await prisma.user.upsert({
    where: { email: "admin@visahub.com" },
    update: { passwordHash: adminHash, role: "ADMIN", isActive: true, emailVerified: true },
    create: {
      name: "VisaHub Admin",
      email: "admin@visahub.com",
      passwordHash: adminHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  if (demoHash) {
    const demoDob = utcDate(1992, 7, 15);

    // Repair previously corrupted `dob` stored as plain string in MongoDB
    await tryRawCommand(
      {
        update: "User",
        updates: [
          {
            q: { email: "user@example.com" },
            u: { $set: { dob: { $date: demoDob.toISOString() } } },
            multi: false,
          },
        ],
      } as Prisma.InputJsonObject,
      "dob corruption repair"
    );

    await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: { passwordHash: demoHash, dob: demoDob },
      create: {
        name: "Demo User",
        email: "user@example.com",
        passwordHash: demoHash,
        role: "USER",
        phone: "+91 98765 43210",
        country: "India",
        nationality: "Indian",
        dob: demoDob,
        gender: "Male",
        address: "Mumbai, Maharashtra, India",
      },
    });
    console.log("  ✓ Demo user: user@example.com");
  } else {
    console.log("  ⊘ Skipped demo user (no DEMO_SEED_PASSWORD)");
  }
}

async function seedSuppliers(
  tx: Prisma.TransactionClient,
  supplierHash: string
): Promise<void> {
  for (const s of SEED_SUPPLIERS) {
    await tx.supplier.upsert({
      where: { email: s.email },
      update: { passwordHash: supplierHash, ...s },
      create: { ...s, passwordHash: supplierHash },
    });
  }
  console.log(`  ✓ ${SEED_SUPPLIERS.length} suppliers upserted`);
}

async function seedCountries(tx: Prisma.TransactionClient): Promise<void> {
  for (const { slug: _slug, ...data } of SEED_COUNTRIES) {
    await tx.country.upsert({
      where: { code: data.code },
      update: { name: data.name, flag: data.flag, description: data.description, continent: data.continent },
      create: { ...data, isActive: true, isCustom: false },
    });
  }
  console.log(`  ✓ ${SEED_COUNTRIES.length} countries upserted`);
}

async function seedFormConfigs(tx: Prisma.TransactionClient): Promise<void> {
  const entries = Object.entries(VISA_FORM_CONFIGS);
  for (const [schemaId, config] of entries) {
    const c = config as { formLabel?: string; sections?: unknown };
    await tx.visaFormConfig.upsert({
      where: { schemaId },
      update: {
        formLabel: c.formLabel ?? schemaId,
        sections: (c.sections as Prisma.InputJsonValue) ?? [],
      },
      create: {
        schemaId,
        formLabel: c.formLabel ?? schemaId,
        sections: (c.sections as Prisma.InputJsonValue) ?? [],
        isDefault: true,
      },
    });
  }
  console.log(`  ✓ ${entries.length} form configs upserted`);
}

async function seedVisas(tx: Prisma.TransactionClient): Promise<void> {
  const validSchemas = new Set(
    (await tx.visaFormConfig.findMany({ select: { schemaId: true } })).map((f) => f.schemaId)
  );

  let upserted = 0;
  let skipped = 0;

  for (const v of SEED_VISAS) {
    if (!validSchemas.has(v.formSchemaId)) {
      console.warn(`    ⚠ Skipped visa "${v.slug}" — no form config for "${v.formSchemaId}"`);
      skipped++;
      continue;
    }

    await tx.visa.upsert({
      where: { visaSlug: v.slug },
      update: {
        name: v.name,
        fee: v.fee,
        processingTime: v.processingTime,
        validity: v.validity,
        stayDuration: v.stayDuration,
        documentsRequired: v.documentsRequired,
        formSchemaId: v.formSchemaId,
      },
      create: {
        visaSlug: v.slug,
        countryCode: v.countryCode,
        name: v.name,
        category: v.category,
        fee: v.fee,
        processingTime: v.processingTime,
        validity: v.validity,
        stayDuration: v.stayDuration,
        documentsRequired: v.documentsRequired,
        formSchemaId: v.formSchemaId,
        isActive: true,
        isCustom: false,
      },
    });
    upserted++;
  }

  console.log(`  ✓ ${upserted} visas upserted${skipped > 0 ? ` (${skipped} skipped)` : ""}`);
}

async function seedAdminCatalogBlobs(tx: Prisma.TransactionClient): Promise<void> {
  // Repair null timestamps from earlier broken seeds before upsert touches records
  const nowIso = new Date().toISOString();
  await tryRawCommand(
    {
      update: "AdminConfig",
      updates: [
        { q: { createdAt: null }, u: { $set: { createdAt: { $date: nowIso }, updatedAt: { $date: nowIso } } }, multi: true },
        { q: { updatedAt: null }, u: { $set: { updatedAt: { $date: nowIso } } }, multi: true },
      ],
    } as Prisma.InputJsonObject,
    "AdminConfig null-timestamp repair"
  );

  const storedCountries = SEED_COUNTRIES.map(({ slug, ...country }) => ({
    id: slug,
    ...country,
    source: "static" as const,
  }));
  const storedVisas = SEED_VISAS.map(({ slug, ...visa }) => ({
    id: slug,
    ...visa,
    source: "static" as const,
  }));

  await tx.adminConfig.upsert({
    where: { key: "admin_catalog_countries" },
    update: { value: storedCountries as unknown as Prisma.InputJsonValue },
    create: { key: "admin_catalog_countries", value: storedCountries as unknown as Prisma.InputJsonValue },
  });

  await tx.adminConfig.upsert({
    where: { key: "admin_catalog_visas" },
    update: { value: storedVisas as unknown as Prisma.InputJsonValue },
    create: { key: "admin_catalog_visas", value: storedVisas as unknown as Prisma.InputJsonValue },
  });

  console.log("  ✓ admin_catalog_countries + admin_catalog_visas blobs upserted");

  // Both keys store the same data intentionally:
  //   admin_form_configs         → live config (mutated by admin UI)
  //   admin_form_config_defaults → immutable baseline for "reset to defaults"
  const formConfigValue = VISA_FORM_CONFIGS as unknown as Prisma.InputJsonValue;

  await tx.adminConfig.upsert({
    where: { key: "admin_form_configs" },
    update: { value: formConfigValue },
    create: { key: "admin_form_configs", value: formConfigValue },
  });

  await tx.adminConfig.upsert({
    where: { key: "admin_form_config_defaults" },
    update: { value: formConfigValue },
    create: { key: "admin_form_config_defaults", value: formConfigValue },
  });

  console.log("  ✓ admin_form_configs + admin_form_config_defaults blobs upserted");
}

async function seedSiteContent(): Promise<void> {
  console.log("── Step 4/4: Site content ─────────────────");

  await prisma.adminConfig.upsert({
    where: { key: "site_content" },
    update: { value: DEFAULT_SITE_CONTENT as unknown as Prisma.InputJsonValue },
    create: { key: "site_content", value: DEFAULT_SITE_CONTENT as unknown as Prisma.InputJsonValue },
  });

  console.log("  ✓ site_content seeded");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const t0 = Date.now();

  // ── Guards ──────────────────────────────────────────────────────────────────
  assertNotProduction();

  const adminPassword = requireEnv("ADMIN_SEED_PASSWORD", "Add ADMIN_SEED_PASSWORD=... to your .env");
  const demoPassword = process.env.DEMO_SEED_PASSWORD;
  const supplierPassword = process.env.SUPPLIER_SEED_PASSWORD;

  if (!supplierPassword) {
    // Explicit — do NOT silently fall back to another account's password
    console.error(
      "⚠  SUPPLIER_SEED_PASSWORD not set — suppliers will NOT be seeded.\n" +
      "   Add SUPPLIER_SEED_PASSWORD=... to your .env to enable."
    );
  }

  console.log("╔══════════════════════════════════════════╗");
  console.log("║        VisaHub Database Seed             ║");
  console.log(`║  NODE_ENV: ${(process.env.NODE_ENV ?? "unset").padEnd(29)}║`);
  console.log(`║  Started:  ${new Date().toISOString().padEnd(29)}║`);
  console.log("╚══════════════════════════════════════════╝\n");

  // Hash all passwords in parallel — one bcrypt wait instead of three sequential
  const [adminHash, demoHash, supplierHash] = await Promise.all([
    bcrypt.hash(adminPassword, BCRYPT_ROUNDS),
    demoPassword ? bcrypt.hash(demoPassword, BCRYPT_ROUNDS) : Promise.resolve(undefined),
    supplierPassword ? bcrypt.hash(supplierPassword, BCRYPT_ROUNDS) : Promise.resolve(undefined),
  ]);

  // Step 1 — Users (idempotent upserts, no transaction needed)
  await seedUsers(adminHash, demoHash);

  // Steps 2–3 — Catalog (single transaction: all-or-nothing)
  console.log("\n── Steps 2–3: Catalog (transaction) ───────");

  await prisma.$transaction(
    async (tx) => {
      if (supplierHash) {
        await seedSuppliers(tx, supplierHash);
      } else {
        console.log("  ⊘ Skipped suppliers (no SUPPLIER_SEED_PASSWORD)");
      }

      await seedCountries(tx);
      await seedFormConfigs(tx);
      await seedVisas(tx);
      await seedAdminCatalogBlobs(tx);
    },
    { timeout: TX_TIMEOUT_MS }
  );

  // Step 4 — Site content (isolated: failure here won't roll back catalog)
  await seedSiteContent();

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  Seed complete ✓  (${elapsed(t0)})`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`══════════════════════════════════════════\n`);
}

// ─── Entry ───────────────────────────────────────────────────────────────────

main()
  .catch((error: unknown) => {
    console.error("\n❌ Seed failed:\n");
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
