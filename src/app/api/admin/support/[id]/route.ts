import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { toIsoOrNull } from "@/lib/route-helpers";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!ticket) return notFound("Ticket not found");

    return ok({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: toIsoOrNull(ticket.resolvedAt),
      closedAt: toIsoOrNull(ticket.closedAt),
      replies: ticket.replies.map((reply) => ({
        ...reply,
        createdAt: reply.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[GET /api/admin/support/[id]]", e);
    return err("Failed to fetch ticket", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const { status, priority, reply } = await req.json();

    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) return notFound("Ticket not found");

    if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return err("Invalid status");
    }

    if (priority && !(VALID_PRIORITIES as readonly string[]).includes(priority)) {
      return err("Invalid priority");
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      data.status = status;
      data.resolvedAt = status === "resolved" ? new Date() : status === "closed" ? existing.resolvedAt : null;
      data.closedAt = status === "closed" ? new Date() : null;
    }
    if (priority !== undefined) data.priority = priority;

    const [updated] = await Promise.all([
      prisma.supportTicket.update({
        where: { id },
        data,
      }),
      typeof reply === "string" && reply.trim() !== ""
        ? prisma.ticketReply.create({
            data: {
              ticketId: id,
              message: reply.trim(),
              authorId: session.sub,
              authorRole: "ADMIN",
            },
          })
        : Promise.resolve(null),
    ]);

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: updated.id },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) return notFound("Ticket not found");

    return ok({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: toIsoOrNull(ticket.resolvedAt),
      closedAt: toIsoOrNull(ticket.closedAt),
      replies: ticket.replies.map((ticketReply) => ({
        ...ticketReply,
        createdAt: ticketReply.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[PATCH /api/admin/support/[id]]", e);
    return err("Failed to update ticket", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) return notFound("Ticket not found");

    await prisma.ticketReply.deleteMany({ where: { ticketId: id } });
    await prisma.supportTicket.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/support/[id]]", e);
    return err("Failed to delete ticket", 500);
  }
}
