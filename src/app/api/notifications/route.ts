import { Prisma } from "@prisma/client";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));
  const unread = searchParams.get("unread") === "true";

  const where: Prisma.NotificationWhereInput = { userId: session.sub };
  if (unread) where.read = false;

  try {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.sub, read: false },
      }),
    ]);

    return ok({
      notifications,
      total,
      page,
      limit,
      unreadCount,
    });
  } catch (e) {
    // BUG FIX: missing try/catch — Prisma errors would crash with unhandled rejection
    console.error("[GET /api/notifications]", e);
    const { err } = await import("@/lib/api-response");
    return err("Failed to fetch notifications", 500);
  }
}
