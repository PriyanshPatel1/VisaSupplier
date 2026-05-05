import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";
import { parseOptionalDateTime } from "@/lib/route-helpers";
import { writeAudit, auditMeta } from "@/lib/audit";

const VALID_STATUSES = [
  "draft",
  "submitted",
  "processing",
  "approved",
  "rejected",
  "cancelled",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: applicationResponseInclude,
  });

  if (!app) return notFound("Application not found");
  return ok(serializeApplication(app));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const { status, supplierNotes, referenceNumber, estimatedDecision } = await req.json();

    const app = await prisma.application.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!app) return notFound();

    if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return err("Invalid status");
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
        ...(referenceNumber !== undefined && { referenceNumber }),
        ...(estimatedDecision !== undefined && { estimatedDecision: parsedEstimatedDecision }),
        supplierUpdatedAt: new Date(),
        ...(status && status !== "draft" && !app.submittedAt && { submittedAt: new Date() }),
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
          changedByRole: "ADMIN",
          note: `Status changed by admin from ${app.status} to ${status}`,
        },
      });

      await writeAudit({
        action: "STATUS_CHANGE",
        entityType: "Application",
        entityId: id,
        description: `Status changed from ${app.status} to ${status}`,
        before: { status: app.status },
        after: { status },
        actorUserId: session.sub,
        actorRole: "ADMIN",
        ...auditMeta(req),
      });
      const messages: Record<string, string> = {
        processing: "Your application is now being processed by our team.",
        approved: "Congratulations! Your visa application has been approved.",
        rejected:
          "Unfortunately your visa application was not approved. Please contact support for next steps.",
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
    console.error("[PATCH /api/admin/applications/[id]]", e);
    return err("Failed to update application", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return notFound("Application not found");

    await prisma.application.delete({ where: { id } });

    await writeAudit({
      action: "DELETE",
      entityType: "Application",
      entityId: id,
      description: `Application deleted by admin`,
      before: { visaName: app.visaName, status: app.status },
      actorUserId: session.sub,
      actorRole: "ADMIN",
      ...auditMeta(req),
    });

    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/applications/[id]]", e);
    return err("Failed to delete application", 500);
  }
}
