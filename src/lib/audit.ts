/**
 * Audit log helper.
 *
 * Call `writeAudit()` in any admin or supplier route that performs a
 * sensitive action (status change, user deactivation, supplier CRUD,
 * payment updates, visa/country CRUD, settings changes).
 *
 * Note: actorUserId XOR actorSupplierId — never both. The schema enforces
 * this at the app layer (see prisma/schema.prisma AuditLog model).
 */

import { AuditAction, Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Set for USER or ADMIN actors */
  actorUserId?: string;
  /** Set for SUPPLIER actors */
  actorSupplierId?: string;
  actorRole?: Role;
}

/**
 * Write a single audit log entry.
 * Errors are swallowed so a logging failure never breaks the main request.
 */
export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        description: params.description ?? null,
        before: (params.before ?? null) as Prisma.InputJsonValue | null,
        after: (params.after ?? null) as Prisma.InputJsonValue | null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        actorUserId: params.actorUserId ?? null,
        actorSupplierId: params.actorSupplierId ?? null,
        actorRole: params.actorRole ?? null,
      },
    });
  } catch (e) {
    // Never let audit failure bubble up — log and continue
    console.error("[audit] Failed to write audit log:", e);
  }
}

/**
 * Helper to extract IP + UA from a Next.js Request for audit entries.
 */
export function auditMeta(req: Request): Pick<AuditParams, "ipAddress" | "userAgent"> {
  return {
    ipAddress: (req.headers as Headers).get("x-forwarded-for") ?? null,
    userAgent: (req.headers as Headers).get("user-agent") ?? null,
  };
}
