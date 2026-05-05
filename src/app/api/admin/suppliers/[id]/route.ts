import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { writeAudit, auditMeta } from "@/lib/audit";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        applications: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) return notFound("Supplier not found");

    const apps = supplier.applications;
    const approved = apps.filter((application) => application.status === "approved").length;
    const rejected = apps.filter((application) => application.status === "rejected").length;
    const processing = apps.filter((application) => application.status === "processing").length;
    const submitted = apps.filter((application) => application.status === "submitted").length;
    const revenue = apps.reduce((sum, application) => sum + application.totalPaid, 0);
    const approvalRate = apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0;

    return ok({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      type: supplier.type,
      priceMultiplier: supplier.priceMultiplier,
      rating: supplier.rating,
      createdAt: supplier.createdAt.toISOString(),
      stats: { totalApps: apps.length, approved, rejected, processing, submitted, revenue, approvalRate },
      applications: apps.map((application) => ({
        id: application.id,
        visaName: application.visaName,
        countryName: application.countryName,
        countryCode: application.countryCode,
        status: application.status,
        totalPaid: application.totalPaid,
        submittedAt: application.submittedAt?.toISOString() ?? application.createdAt.toISOString(),
        userName: application.user.name,
        userEmail: application.user.email,
      })),
    });
  } catch (e) {
    console.error("[GET /api/admin/suppliers/[id]]", e);
    return err("Failed to fetch supplier", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const {
      name,
      email,
      password,
      type,
      phone,
      address,
      logo,
      description,
      website,
      priceMultiplier,
      rating,
      isActive,
      isVerified,
    } = await req.json();

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return notFound("Supplier not found");

    if (email && String(email).trim().toLowerCase() !== existing.email) {
      const conflict = await prisma.supplier.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
      if (conflict) return err("Email already in use by another supplier", 409);
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (type !== undefined) data.type = type;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (logo !== undefined) data.logo = logo;
    if (description !== undefined) data.description = description;
    if (website !== undefined) data.website = website;
    if (priceMultiplier !== undefined) data.priceMultiplier = priceMultiplier;
    if (rating !== undefined) data.rating = rating;
    if (isActive !== undefined) data.isActive = isActive;
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (password) data.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const updated = await prisma.supplier.update({ where: { id }, data });

    return ok({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      type: updated.type,
      phone: updated.phone,
      address: updated.address,
      logo: updated.logo,
      description: updated.description,
      website: updated.website,
      priceMultiplier: updated.priceMultiplier,
      rating: updated.rating,
      isActive: updated.isActive,
      isVerified: updated.isVerified,
    });
  } catch (e) {
    console.error("[PATCH /api/admin/suppliers/[id]]", e);
    return err("Failed to update supplier", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return notFound("Supplier not found");

    const activeApps = await prisma.application.count({
      where: {
        supplierId: id,
        status: { in: ["submitted", "processing"] },
      },
    });

    if (activeApps > 0) {
      return err(`Cannot delete supplier with ${activeApps} active application(s). Reassign first.`, 409);
    }

    await prisma.supplier.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/suppliers/[id]]", e);
    return err("Failed to delete supplier", 500);
  }
}
