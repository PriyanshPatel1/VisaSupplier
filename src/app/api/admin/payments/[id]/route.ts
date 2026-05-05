import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { parseOptionalDateTime, toIsoOrNull } from "@/lib/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        supplier: { select: { name: true, type: true, email: true } },
      },
    });

    if (!app) return notFound("Payment not found");

    return ok({
      id: app.id,
      visaName: app.visaName,
      countryName: app.countryName,
      countryCode: app.countryCode,
      totalPaid: app.totalPaid,
      status: app.status,
      submittedAt: app.submittedAt?.toISOString() ?? app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      referenceNumber: app.referenceNumber,
      supplierNotes: app.supplierNotes,
      estimatedDecision: toIsoOrNull(app.estimatedDecision),
      userName: app.user.name,
      userEmail: app.user.email,
      userPhone: app.user.phone,
      supplierName: app.supplier.name,
      supplierType: app.supplier.type,
      supplierEmail: app.supplier.email,
    });
  } catch (e) {
    console.error("[GET /api/admin/payments/[id]]", e);
    return err("Failed to fetch payment", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return notFound("Payment not found");

    const { status, referenceNumber, supplierNotes, estimatedDecision, totalPaid } = await req.json();

    let parsedEstimatedDecision: Date | null | undefined;
    try {
      parsedEstimatedDecision = parseOptionalDateTime(estimatedDecision, "estimatedDecision");
    } catch {
      return err("Invalid estimatedDecision");
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (referenceNumber !== undefined) data.referenceNumber = referenceNumber;
    if (supplierNotes !== undefined) data.supplierNotes = supplierNotes;
    if (estimatedDecision !== undefined) data.estimatedDecision = parsedEstimatedDecision;
    if (totalPaid !== undefined) data.totalPaid = Number(totalPaid);

    const updated = await prisma.application.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        supplier: { select: { name: true, type: true } },
      },
    });

    if (status && status !== app.status) {
      const messages: Record<string, string> = {
        processing: "Your payment is being processed.",
        approved: "Your visa application has been approved!",
        rejected: "Your visa application was not approved. Contact support for assistance.",
      };
      if (messages[status]) {
        await prisma.notification.create({
          data: {
            userId: app.userId,
            title: `Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: messages[status],
            type: status === "approved" ? "success" : status === "rejected" ? "error" : "info",
            actionUrl: `/user/applications/${id}`,
          },
        });
      }
    }

    return ok({
      id: updated.id,
      visaName: updated.visaName,
      totalPaid: updated.totalPaid,
      status: updated.status,
      referenceNumber: updated.referenceNumber,
      supplierNotes: updated.supplierNotes,
      estimatedDecision: toIsoOrNull(updated.estimatedDecision),
      updatedAt: updated.updatedAt.toISOString(),
      userName: updated.user.name,
      userEmail: updated.user.email,
      supplierName: updated.supplier.name,
    });
  } catch (e) {
    console.error("[PATCH /api/admin/payments/[id]]", e);
    return err("Failed to update payment", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return notFound("Payment record not found");

    await prisma.application.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/payments/[id]]", e);
    return err("Failed to delete payment record", 500);
  }
}
