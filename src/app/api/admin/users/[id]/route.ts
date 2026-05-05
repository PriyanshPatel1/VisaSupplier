import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";
import { parseOptionalDateTime } from "@/lib/route-helpers";
import { writeAudit, auditMeta } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        country: true,
        nationality: true,
        dob: true,
        gender: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { applications: true, documents: true, notifications: true } },
        applications: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            visaName: true,
            countryName: true,
            countryCode: true,
            status: true,
            totalPaid: true,
            submittedAt: true,
            createdAt: true,
            supplier: { select: { name: true } },
          },
        },
      },
    });

    if (!user) return notFound("User not found");

    return ok({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      applications: user.applications.map((application) => ({
        ...application,
        submittedAt: application.submittedAt?.toISOString() ?? application.createdAt.toISOString(),
        supplierName: application.supplier?.name ?? "-",
      })),
    });
  } catch (e) {
    console.error("[GET /api/admin/users/[id]]", e);
    return err("Failed to fetch user", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    const body = await req.json();
    const { name, email, phone, country, nationality, dob, gender, address, password } = body;

    let parsedDob: Date | null | undefined;
    try {
      parsedDob = parseOptionalDateTime(dob, "dob");
    } catch {
      return err("Invalid dob");
    }

    if (email && email !== existing.email) {
      const conflict = await prisma.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
      if (conflict) return err("Email already registered", 409);
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (phone !== undefined) data.phone = phone;
    if (country !== undefined) data.country = country;
    if (nationality !== undefined) data.nationality = nationality;
    if (dob !== undefined) data.dob = parsedDob;
    if (gender !== undefined) data.gender = gender;
    if (address !== undefined) data.address = address;
    if (password) data.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const updated = await prisma.user.update({ where: { id }, data });

    await writeAudit({
      action: "UPDATE",
      entityType: "User",
      entityId: id,
      description: "Admin updated user profile",
      before: { name: existing.name, email: existing.email, isActive: existing.isActive },
      after: { name: updated.name, email: updated.email, isActive: updated.isActive },
      actorUserId: session.sub,
      actorRole: "ADMIN",
      ...auditMeta(req),
    });

    return ok({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      country: updated.country,
      nationality: updated.nationality,
      dob: updated.dob,
      gender: updated.gender,
      address: updated.address,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("[PATCH /api/admin/users/[id]]", e);
    return err("Failed to update user", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    // BUG FIX: emailVerificationToken not cleaned up → orphaned tokens
    // BUG FIX: Payment records with applicationId → orphaned after applications deleted
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: id } });
    await prisma.emailVerificationToken.deleteMany({ where: { userId: id } });
    await prisma.supportTicket.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    const documents = await prisma.document.findMany({
      where: { userId: id },
      select: { id: true },
    });

    await prisma.applicationDocument.deleteMany({
      where: {
        documentId: {
          in: documents.map((document) => document.id),
        },
      },
    });
    await prisma.document.deleteMany({ where: { userId: id } });

    // Nullify applicationId on Payment records before deleting applications
    // so Payment audit history is preserved but not orphaned with a broken FK
    const userApps = await prisma.application.findMany({
      where: { userId: id },
      select: { id: true },
    });
    if (userApps.length > 0) {
      await prisma.payment.updateMany({
        where: { applicationId: { in: userApps.map((a) => a.id) } },
        data: { applicationId: null },
      });
    }

    await prisma.application.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    await writeAudit({
      action: "DELETE",
      entityType: "User",
      entityId: id,
      description: "Admin deleted user",
      before: { name: existing.name, email: existing.email },
      actorUserId: session.sub,
      actorRole: "ADMIN",
      ...auditMeta(req),
    });

    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/users/[id]]", e);
    return err("Failed to delete user", 500);
  }
}
