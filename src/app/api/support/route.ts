import { NextRequest } from "next/server";
import { TicketPriority } from "@prisma/client";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { err, ok, unauthorized } from "@/lib/api-response";
import { toIsoOrNull } from "@/lib/route-helpers";

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session || session.role !== "USER") return unauthorized();

  try {
    const { userName, email, subject, message, priority } = await req.json();

    const normalizedUserName = String(userName ?? session.name ?? "").trim();
    const normalizedEmail = String(email ?? session.email ?? "").trim().toLowerCase();
    const normalizedSubject = String(subject ?? "").trim();
    const normalizedMessage = String(message ?? "").trim();
    const normalizedPriority = String(priority ?? "medium").trim().toLowerCase();

    if (!normalizedUserName || !normalizedEmail || !normalizedSubject || !normalizedMessage) {
      return err("userName, email, subject and message are required");
    }

    if (!(VALID_PRIORITIES as readonly string[]).includes(normalizedPriority)) {
      return err("Invalid priority");
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.sub,
        userName: normalizedUserName,
        email: normalizedEmail,
        subject: normalizedSubject,
        message: normalizedMessage,
        priority: normalizedPriority as TicketPriority,
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
  } catch (error) {
    console.error("[POST /api/support]", error);
    return err("Failed to create support ticket", 500);
  }
}
