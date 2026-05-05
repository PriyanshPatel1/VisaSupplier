import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!notification) return notFound("Notification not found");

    return ok({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("[GET /api/admin/notifications/[id]]", e);
    return err("Failed to fetch notification", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return notFound("Notification not found");

    const { read, title, message, type, actionUrl } = await req.json();

    const data: Record<string, unknown> = {};
    if (read      !== undefined) data.read      = Boolean(read);
    if (title     !== undefined) data.title     = title;
    if (message   !== undefined) data.message   = message;
    if (type      !== undefined) data.type      = type;
    if (actionUrl !== undefined) data.actionUrl = actionUrl;

    const updated = await prisma.notification.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return ok({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("[PATCH /api/admin/notifications/[id]]", e);
    return err("Failed to update notification", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return notFound("Notification not found");

    await prisma.notification.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/notifications/[id]]", e);
    return err("Failed to delete notification", 500);
  }
}
