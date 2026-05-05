import { NextRequest } from "next/server";
import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, forbidden, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";
import { parseOptionalDateTime } from "@/lib/route-helpers";

const VALID_STATUSES = [
  "draft",
  "submitted",
  "processing",
  "approved",
  "rejected",
  "cancelled",
] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: applicationResponseInclude,
  });

  if (!app) return notFound();
  if (app.supplierId !== session.sub) return forbidden();
  return ok(serializeApplication(app));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });
    if (!app) return notFound();
    if (app.supplierId !== session.sub) return forbidden();

    const { status, supplierNotes, supplierStatus, referenceNumber, estimatedDecision } = await req.json();

    if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return err(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    let parsedEstimatedDecision: Date | null | undefined;
    try {
      parsedEstimatedDecision = parseOptionalDateTime(estimatedDecision, "estimatedDecision");
    } catch {
      return err("Invalid estimatedDecision");
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(supplierNotes !== undefined && { supplierNotes }),
        ...(supplierStatus !== undefined && { supplierStatus }),
        ...(referenceNumber !== undefined && { referenceNumber }),
        ...(estimatedDecision !== undefined && { estimatedDecision: parsedEstimatedDecision }),
        supplierUpdatedAt: new Date(),
      },
      include: applicationResponseInclude,
    });

    if (status && status !== app.status) {
      await prisma.applicationStatusLog.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: status,
          changedById: session.sub,
          changedByRole: "SUPPLIER",
          note: `Status updated by supplier from ${app.status} to ${status}`,
        },
      });

      const messages: Record<string, string> = {
        processing: "Your application is now being processed.",
        approved: "Your visa application has been approved!",
        rejected: "Your visa application was not approved. Please contact support.",
        cancelled: "Your application has been cancelled.",
      };
      if (messages[status]) {
        await prisma.notification.create({
          data: {
            userId: app.user.id,
            title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: messages[status],
            type: status === "approved" ? "success" : status === "rejected" ? "error" : "info",
            actionUrl: `/user/applications/${id}`,
          },
        });
      }
    }

    return ok(serializeApplication(updated));
  } catch (e) {
    console.error("[PATCH /api/supplier/applications/[id]]", e);
    return err("Failed to update application", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!app) return notFound("Application not found");
    if (app.supplierId !== session.sub) return forbidden();

    if (app.status !== "submitted" && app.status !== "draft") {
      return err(
        `Cannot withdraw application with status '${app.status}'. Only draft or submitted applications can be withdrawn.`,
        409,
      );
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: "cancelled",
        supplierUpdatedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: app.user.id,
        title: "Application Withdrawn",
        message:
          `Your ${app.visaName} application for ${app.countryName} has been withdrawn by the processing agent. Please contact support for assistance or resubmit.`,
        type: "warning",
      },
    });

    return ok({ deleted: true, applicationId: id, status: "cancelled" });
  } catch (e) {
    console.error("[DELETE /api/supplier/applications/[id]]", e);
    return err("Failed to withdraw application", 500);
  }
}
