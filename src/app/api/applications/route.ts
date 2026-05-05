import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";
import { summarizeTracking } from "@/lib/application-tracking";
import { attachApplicationDocuments } from "@/lib/application-documents";
import { getPublishedVisaById, getPublishedFormConfig } from "@/lib/content-catalog";
import type { WizardConfig, WizardSection } from "@/components/form/GenericWizard";
import {
  applicationsListQuerySchema,
  createApplicationSchema,
  parseRequestBody,
  parseSearchParams,
} from "@/lib/validators";

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

/**
 * Classifies a section title into one of the fixed DB columns.
 * Returns null for sections that should go into `other`.
 */
function classifySection(title: string): "personal" | "passport" | "travel" | null {
  const t = title.trim().toLowerCase();
  if (t.includes("personal")) return "personal";
  if (t.includes("passport")) return "passport";
  if (t.includes("travel")) return "travel";
  return null;
}

/**
 * Converts a section's raw field values (fieldId → value) into a
 * human-readable map (fieldLabel → value) using the section config.
 * Falls back to fieldId when a label is not found.
 */
function labeliseSection(
  section: WizardSection,
  rawValues: Record<string, unknown>,
): Record<string, unknown> {
  const labelled: Record<string, unknown> = {};
  for (const field of section.fields) {
    const raw = rawValues[field.id];
    if (raw === undefined || raw === null || raw === "") continue;
    labelled[field.label ?? field.id] = raw;
  }
  // Preserve any extra keys that don't appear in the field list (safety net).
  for (const [key, value] of Object.entries(rawValues)) {
    const known = section.fields.some((f) => f.id === key);
    if (!known && value !== undefined && value !== null && value !== "") {
      labelled[key] = value;
    }
  }
  return labelled;
}

/**
 * Build structured section data from formData using the form config.
 *
 * For seeded forms (section IDs "personal" / "passport" / "travel") this
 * works exactly as before.  For admin-built forms (random section UIDs) this
 * classifies sections by their title and stores all data properly.
 *
 * Returns { personal, passport, travel, other, documents }
 */
function buildSectionData(
  rawFormData: Record<string, unknown>,
  formConfig: WizardConfig | null,
): {
  personal: Record<string, unknown>;
  passport: Record<string, unknown>;
  travel: Record<string, unknown>;
  other: Record<string, unknown>;
  documents: Record<string, unknown>;
} {
  const personal: Record<string, unknown> = {};
  const passport: Record<string, unknown> = {};
  const travel: Record<string, unknown> = {};
  const other: Record<string, unknown> = {};
  const documents: Record<string, unknown> = {};

  if (!formConfig || formConfig.sections.length === 0) {
    // No config available – fall back to key-name matching (seeded forms).
    return {
      personal: asRecord(rawFormData.personal),
      passport: asRecord(rawFormData.passport),
      travel: asRecord(rawFormData.travel),
      other: rawFormData,
      documents: asRecord(rawFormData.documents),
    };
  }

  for (const section of formConfig.sections) {
    const sectionValues = asRecord(rawFormData[section.id]);

    // Collect file fields into documents.
    for (const field of section.fields) {
      if (field.type === "file") {
        const val = sectionValues[field.id];
        if (val !== undefined && val !== null && val !== "") {
          documents[field.id] = val;
        }
      }
    }

    // Build labelled map for non-file fields.
    const labelledValues = labeliseSection(section, sectionValues);

    const bucket = classifySection(section.title);
    if (bucket === "personal") {
      Object.assign(personal, labelledValues);
    } else if (bucket === "passport") {
      Object.assign(passport, labelledValues);
    } else if (bucket === "travel") {
      Object.assign(travel, labelledValues);
    } else {
      // Custom section – store under a key equal to the section title.
      other[section.title] = labelledValues;
    }
  }

  // Always keep the raw formData blob too, keyed under "_raw", so nothing is
  // ever permanently lost even if the form config changes later.
  other._raw = rawFormData;

  return { personal, passport, travel, other, documents };
}

// GET /api/applications - paginated tracking list for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const parsed = parseSearchParams(applicationsListQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) return err(parsed.error);
    const { status, q, page, pageSize, sortBy, sortDir } = parsed.data;

    const baseWhere: Prisma.ApplicationWhereInput = { userId: session.sub };
    const where: Prisma.ApplicationWhereInput = { ...baseWhere };

    if (status !== "all") where.status = status;
    if (q.length > 0) {
      where.OR = [
        { visaName: { contains: q, mode: "insensitive" } },
        { countryName: { contains: q, mode: "insensitive" } },
        { referenceNumber: { contains: q, mode: "insensitive" } },
        { supplier: { is: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [apps, total, statusGroups] = await Promise.all([
      prisma.application.findMany({
        where,
        include: applicationResponseInclude,
        orderBy: { [sortBy]: sortDir } as Prisma.ApplicationOrderByWithRelationInput,
        skip,
        take: pageSize,
      }),
      prisma.application.count({ where }),
      prisma.application.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { status: true },
      }),
    ]);

    const statusCounts = {
      all: 0,
      draft: 0,
      submitted: 0,
      processing: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    for (const group of statusGroups) {
      statusCounts[group.status] = group._count.status;
      statusCounts.all += group._count.status;
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = apps.map((app) => ({
      ...serializeApplication(app),
      tracking: summarizeTracking(app),
      canCancel: app.status === "draft" || app.status === "submitted",
    }));

    return ok({
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        q,
        status,
        sortBy,
        sortDir,
        statusCounts,
      },
    });
  } catch (e) {
    console.error("[GET /api/applications]", e);
    return err("Failed to fetch applications", 500);
  }
}

// POST /api/applications - submit a new application
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const parsed = await parseRequestBody(req, createApplicationSchema);
    if (!parsed.success) return err(parsed.error);
    const {
      visaId,
      supplierId,
      totalPaid: paid,
      formData,
    } = parsed.data;

    const rawFormData = asRecord(formData);

    // Fetch the form config, visa, and supplier concurrently.
    const [supplier, visa, formConfig] = await Promise.all([
      prisma.supplier.findFirst({
        where: { id: supplierId, isActive: true },
        select: { id: true },
      }),
      getPublishedVisaById(visaId),
      getPublishedFormConfig(visaId).catch(() => null),
    ]);

    if (!supplier) return err("Supplier not found", 404);
    if (!visa) return err("Visa not found", 404);

    // Resolve country name from catalog
    const { getPublishedCountries } = await import("@/lib/content-catalog");
    const countries = await getPublishedCountries();
    const country = countries.find((c) => c.code === visa.countryCode);

    // Build structured data using the form config so that custom admin forms
    // are stored correctly instead of collapsing into empty personal/passport/travel.
    const {
      personal: personalData,
      passport: passportData,
      travel: travelData,
      other: otherData,
      documents: documentsData,
    } = buildSectionData(rawFormData, formConfig);

    const application = await prisma.$transaction(async (tx) => {
      const createdApplication = await tx.application.create({
        data: {
          visaSlug: visa.id,
          visaName: visa.name,
          countryCode: visa.countryCode,
          countryName: country?.name ?? visa.countryCode,
          basePrice: visa.fee,
          serviceFee: Math.max(0, paid - visa.fee),
          totalPaid: paid,
          userId: session.sub,
          supplierId,
          personal: personalData as Prisma.InputJsonValue,
          passport: passportData as Prisma.InputJsonValue,
          travel: travelData as Prisma.InputJsonValue,
          other: otherData as Prisma.InputJsonValue,
          status: "submitted",
          submittedAt: new Date(),
        },
      });

      await attachApplicationDocuments(
        createdApplication.id,
        session.sub,
        documentsData,
        tx,
      );

      await tx.notification.create({
        data: {
          userId: session.sub,
          title: "Application Submitted",
          message: `Your ${createdApplication.visaName} application has been submitted and is under review.`,
          type: "success",
          actionUrl: `/user/applications/${createdApplication.id}`,
        },
      });

      await tx.supplierNotification.create({
        data: {
          supplierId,
          title: "New Application Received",
          message: `A new ${createdApplication.visaName} application has been submitted for your review.`,
          type: "info",
          actionUrl: `/supplier/applications/${createdApplication.id}`,
        },
      });

      return createdApplication;
    });

    const app = await prisma.application.findUnique({
      where: { id: application.id },
      include: applicationResponseInclude,
    });

    if (!app) {
      return err("Failed to load created application", 500);
    }

    return ok(
      {
        ...serializeApplication(app),
        tracking: summarizeTracking(app),
        canCancel: true,
      },
      201,
    );
  } catch (e) {
    console.error("[POST /api/applications]", e);
    return err("Failed to submit application", 500);
  }
}
