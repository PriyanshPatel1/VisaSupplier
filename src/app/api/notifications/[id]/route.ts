import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized, forbidden, notFound } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return notFound();
    if (notif.userId !== session.sub) return forbidden();

    await prisma.notification.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/notifications/[id]]", e);
    return err("Failed to delete notification", 500);
  }
}
