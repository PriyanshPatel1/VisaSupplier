import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

const VALID_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_RESET",
  "STATUS_CHANGE",
  "DOCUMENT_UPLOAD",
  "DOCUMENT_VERIFY",
  "PAYMENT_INITIATED",
  "PAYMENT_REFUNDED",
] as const;

const VALID_ENTITY_TYPES = [
  "Application",
  "User",
  "Supplier",
  "Visa",
  "Country",
  "Payment",
  "Document",
  "SupportTicket",
] as const;

/**
 * GET /api/admin/audit
 * Returns paginated audit log. Admin-only.
 *
 * Query params:
 *   action       – filter by AuditAction enum value
 *   entityType   – filter by entity type string
 *   entityId     – filter by specific entity id
 *   actorUserId  – filter by actor user id
 *   q            – full-text search on description
 *   page         – 1-based page number (default: 1)
 *   limit        – items per page 1-100 (default: 20)
 */
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const actorUserId = searchParams.get("actorUserId");
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

    if (action && !(VALID_ACTIONS as readonly string[]).includes(action)) {
      return err("Invalid action filter");
    }
    if (entityType && !(VALID_ENTITY_TYPES as readonly string[]).includes(entityType)) {
      return err("Invalid entityType filter");
    }

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorUserId) where.actorUserId = actorUserId;
    if (q) {
      where.description = { contains: q, mode: "insensitive" };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          description: true,
          ipAddress: true,
          actorUserId: true,
          actorSupplierId: true,
          actorRole: true,
          createdAt: true,
          // Omit before/after blobs for list view — include only on detail if needed
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return ok({
      logs: logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/admin/audit]", e);
    return err("Failed to fetch audit logs", 500);
  }
}
