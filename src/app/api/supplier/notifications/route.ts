import { NextRequest } from "next/server";
import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

// GET — list SupplierNotification records for this supplier
export async function GET(req: NextRequest) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

    const [notifications, total] = await Promise.all([
      prisma.supplierNotification.findMany({
        where: { supplierId: session.sub },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierNotification.count({ where: { supplierId: session.sub } }),
    ]);

    return ok({
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        readAt: n.readAt?.toISOString() ?? null,
      })),
      total,
      page,
      limit,
    });
  } catch (e) {
    console.error("[GET /api/supplier/notifications]", e);
    return err("Failed to fetch notifications", 500);
  }
}

// POST — internal: create a supplier notification (used by event triggers)
export async function POST(req: NextRequest) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const { title, message, type = "info", actionUrl } = await req.json();

    if (!title?.trim() || !message?.trim()) {
      return err("title and message are required");
    }

    const notification = await prisma.supplierNotification.create({
      data: {
        supplierId: session.sub,
        title,
        message,
        type,
        actionUrl: actionUrl ?? null,
      },
    });

    return ok(
      {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null,
      },
      201,
    );
  } catch (e) {
    console.error("[POST /api/supplier/notifications]", e);
    return err("Failed to create notification", 500);
  }
}
