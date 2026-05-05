import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, forbidden, notFound } from "@/lib/api-response";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) return notFound();
  if (notif.userId !== session.sub) return forbidden();

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });

  return ok(updated);
}
