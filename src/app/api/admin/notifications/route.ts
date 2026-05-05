import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

// GET — list all notifications with optional filters
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const unread  = searchParams.get("unread");
    const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (unread === "true") where.read = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return ok({
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (e) {
    console.error("[GET /api/admin/notifications]", e);
    return err("Failed to fetch notifications", 500);
  }
}

// POST — send a notification to one or all users
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { title, message, type = "info", actionUrl, userId } = await req.json();
    if (!title?.trim() || !message?.trim()) return err("title and message are required");

    if (userId) {
      // Single user
      const notif = await prisma.notification.create({
        data: { userId, title, message, type, actionUrl },
      });
      return ok(notif, 201);
    } else {
      // Broadcast to all users
      const users = await prisma.user.findMany({
        where: { role: "USER" },
        select: { id: true },
      });
      await prisma.notification.createMany({
        data: users.map((u) => ({ userId: u.id, title, message, type, actionUrl })),
      });
      return ok({ sent: users.length }, 201);
    }
  } catch (e) {
    console.error("[POST /api/admin/notifications]", e);
    return err("Failed to send notification", 500);
  }
}
