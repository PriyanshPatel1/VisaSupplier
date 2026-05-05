import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";
import { attachApplicationDocuments } from "@/lib/application-documents";
import { parseOptionalDateTime } from "@/lib/route-helpers";
import { getPublishedVisaById, getPublishedCountries } from "@/lib/content-catalog";

const VALID_STATUSES = [
  "draft",
  "submitted",
  "processing",
  "approved",
  "rejected",
  "cancelled",
] as const;

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("q");
    const supplierId = searchParams.get("supplierId");
    const userId = searchParams.get("userId");
    const countryCode = searchParams.get("countryCode");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

    const where: Prisma.ApplicationWhereInput = {};
    if (status && status !== "all") where.status = status as (typeof VALID_STATUSES)[number];
    if (supplierId) where.supplierId = supplierId;
    if (userId) where.userId = userId;
    if (countryCode) where.countryCode = countryCode;
    if (search) {
      where.OR = [
        { visaName: { contains: search, mode: "insensitive" } },
        { countryName: { contains: search, mode: "insensitive" } },
        { referenceNumber: { contains: search, mode: "insensitive" } },
        { user: { is: { name: { contains: search, mode: "insensitive" } } } },
        { user: { is: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [apps, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: applicationResponseInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return ok({
      apps: apps.map((app) => serializeApplication(app)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/admin/applications]", e);
    return err("Failed to fetch applications", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const {
      userId,
      supplierId,
      visaId,
      totalPaid,
      status = "submitted",
      personal = {},
      passport = {},
      travel = {},
      documents = {},
      supplierNotes,
      referenceNumber,
      estimatedDecision,
    } = body;

    const missing: string[] = [];
    if (!userId) missing.push("userId");
    if (!supplierId) missing.push("supplierId");
    if (!visaId) missing.push("visaId");
    if (totalPaid === undefined || totalPaid === null) missing.push("totalPaid");
    if (missing.length > 0) return err(`Missing required fields: ${missing.join(", ")}`);

    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      return err(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const paid = Number(totalPaid);
    if (Number.isNaN(paid) || paid < 0) return err("totalPaid must be a non-negative number");

    let parsedEstimatedDecision: Date | null | undefined;
    try {
      parsedEstimatedDecision = parseOptionalDateTime(estimatedDecision, "estimatedDecision");
    } catch {
      return err("Invalid estimatedDecision");
    }

    const [user, supplier, visa] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } }),
      getPublishedVisaById(visaId),
    ]);

    if (!user) return err("User not found", 404);
    if (!supplier) return err("Supplier not found", 404);
    if (!visa) return err("Visa not found", 404);

    const countries = await getPublishedCountries();
    const country = countries.find((c) => c.code === visa.countryCode);

    // BUG FIX: attachApplicationDocuments was called OUTSIDE the transaction —
    // if it failed the application existed but had no documents attached.
    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          userId,
          supplierId,
          visaSlug: visa.id,
          visaName: visa.name,
          countryCode: visa.countryCode,
          countryName: country?.name ?? visa.countryCode,
          basePrice: visa.fee,
          serviceFee: Math.max(0, paid - visa.fee),
          totalPaid: paid,
          status,
          personal,
          passport,
          travel,
          supplierNotes: supplierNotes ?? undefined,
          referenceNumber: referenceNumber ?? undefined,
          estimatedDecision: parsedEstimatedDecision,
          submittedAt: status === "draft" ? null : new Date(),
        },
      });

      await attachApplicationDocuments(created.id, userId, documents, tx);
      return created;
    });

    const app = await prisma.application.findUnique({
      where: { id: application.id },
      include: applicationResponseInclude,
    });

    if (!app) return err("Failed to load created application", 500);

    await prisma.notification.create({
      data: {
        userId,
        title: "Application Submitted",
        message: `Your ${app.visaName} application for ${app.countryName} has been submitted successfully.`,
        type: "info",
        actionUrl: `/user/applications/${app.id}`,
      },
    });

    return ok(serializeApplication(app), 201);
  } catch (e) {
    console.error("[POST /api/admin/applications]", e);
    return err("Failed to create application", 500);
  }
}
