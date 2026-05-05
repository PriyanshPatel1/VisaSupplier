import { NextRequest } from "next/server";
import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, forbidden, unauthorized } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

async function verifyOwnership(supplierId: string, notificationId: string) {
  const notification = await prisma.supplierNotification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) return { notification: null, allowed: false };
  return { notification, allowed: notification.supplierId === supplierId };
}

// GET single supplier notification
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const { notification, allowed } = await verifyOwnership(session.sub, id);

    if (!notification) return notFound("Notification not found");
    if (!allowed) return forbidden();

    return ok({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null,
    });
  } catch (e) {
    console.error("[GET /api/supplier/notifications/[id]]", e);
    return err("Failed to fetch notification", 500);
  }
}

// PATCH — mark read or update content
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const { notification, allowed } = await verifyOwnership(session.sub, id);

    if (!notification) return notFound("Notification not found");
    if (!allowed) return forbidden();

    const { title, message, type, actionUrl, read } = await req.json();

    const data: Record<string, unknown> = {};
    if (title     !== undefined) data.title     = title;
    if (message   !== undefined) data.message   = message;
    if (type      !== undefined) data.type      = type;
    if (actionUrl !== undefined) data.actionUrl = actionUrl;
    if (read === true && !notification.read) {
      data.read   = true;
      data.readAt = new Date();
    }

    if (Object.keys(data).length === 0) return err("No fields to update");

    const updated = await prisma.supplierNotification.update({
      where: { id },
      data,
    });

    return ok({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      readAt: updated.readAt?.toISOString() ?? null,
    });
  } catch (e) {
    console.error("[PATCH /api/supplier/notifications/[id]]", e);
    return err("Failed to update notification", 500);
  }
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const { notification, allowed } = await verifyOwnership(session.sub, id);

    if (!notification) return notFound("Notification not found");
    if (!allowed) return forbidden();

    await prisma.supplierNotification.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/supplier/notifications/[id]]", e);
    return err("Failed to delete notification", 500);
  }
}
