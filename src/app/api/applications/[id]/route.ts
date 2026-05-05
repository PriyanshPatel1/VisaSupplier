import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, forbidden, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";
import { buildTrackingTimeline, summarizeTracking } from "@/lib/application-tracking";
import { parseRequestBody, updateApplicationSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({
      where: { id },
      include: applicationResponseInclude,
    });

    if (!app) return notFound("Application not found");
    if (app.userId !== session.sub) return forbidden();

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.sub,
        actionUrl: `/user/applications/${id}`,
      },
      orderBy: { createdAt: "asc" },
    });

    return ok({
      ...serializeApplication(app),
      tracking: summarizeTracking(app),
      timeline: buildTrackingTimeline(app, notifications),
      canCancel: app.status === "draft" || app.status === "submitted",
    });
  } catch (e) {
    console.error("[GET /api/applications/[id]]", e);
    return err("Failed to fetch application", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({ where: { id } });

    if (!app) return notFound("Application not found");
    if (app.userId !== session.sub) return forbidden();

    if (app.status !== "draft" && app.status !== "submitted") {
      return err(`Cannot update application in '${app.status}' status. Contact support for changes.`, 409);
    }

    const parsed = await parseRequestBody(req, updateApplicationSchema);
    if (!parsed.success) return err(parsed.error);
    const { personal, passport, travel } = parsed.data;

    const data: Record<string, unknown> = {};
    if (personal !== undefined) data.personal = personal;
    if (passport !== undefined) data.passport = passport;
    if (travel !== undefined) data.travel = travel;

    const updated = await prisma.application.update({
      where: { id },
      data,
      include: applicationResponseInclude,
    });

    return ok({
      ...serializeApplication(updated),
      tracking: summarizeTracking(updated),
      canCancel: updated.status === "draft" || updated.status === "submitted",
    });
  } catch (e) {
    console.error("[PATCH /api/applications/[id]]", e);
    return err("Failed to update application", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const app = await prisma.application.findUnique({ where: { id } });

    if (!app) return notFound("Application not found");
    if (app.userId !== session.sub) return forbidden();

    if (app.status !== "draft" && app.status !== "submitted") {
      return err(
        `Cannot cancel application with status '${app.status}'. Contact support for assistance.`,
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
        userId: session.sub,
        title: "Application Cancelled",
        message: `Your ${app.visaName} application for ${app.countryName} has been cancelled.`,
        type: "warning",
      },
    });

    return ok({ deleted: true, applicationId: id, status: "cancelled" });
  } catch (e) {
    console.error("[DELETE /api/applications/[id]]", e);
    return err("Failed to cancel application", 500);
  }
}
