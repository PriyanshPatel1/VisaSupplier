import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { toIsoOrNull } from "@/lib/route-helpers";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("q");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

    if (status && status !== "all" && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return err("Invalid status");
    }

    if (
      priority &&
      priority !== "all" &&
      !(VALID_PRIORITIES as readonly string[]).includes(priority)
    ) {
      return err("Invalid priority");
    }

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (priority && priority !== "all") where.priority = priority;
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          _count: { select: { replies: true } },
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return ok({
      tickets: tickets.map((ticket) => ({
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        resolvedAt: toIsoOrNull(ticket.resolvedAt),
        closedAt: toIsoOrNull(ticket.closedAt),
        replyCount: ticket._count.replies,
        replies: ticket.replies.map((reply) => ({
          ...reply,
          createdAt: reply.createdAt.toISOString(),
        })),
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/admin/support]", e);
    return err("Failed to fetch tickets", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userName, email, subject, message, priority } = await req.json();

    if (!userName || !email || !subject || !message) {
      return err("userName, email, subject and message are required");
    }

    if (priority && !(VALID_PRIORITIES as readonly string[]).includes(priority)) {
      return err("Invalid priority");
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userName,
        email,
        subject,
        message,
        priority: priority ?? "medium",
      },
    });

    return ok(
      {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        resolvedAt: toIsoOrNull(ticket.resolvedAt),
        closedAt: toIsoOrNull(ticket.closedAt),
      },
      201,
    );
  } catch (e) {
    console.error("[POST /api/admin/support]", e);
    return err("Failed to create ticket", 500);
  }
}
