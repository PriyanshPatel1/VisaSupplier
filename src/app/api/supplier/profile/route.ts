import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";

export async function GET() {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        phone: true,
        address: true,
        logo: true,
        description: true,
        website: true,
        priceMultiplier: true,
        rating: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
    });

    if (!supplier) return notFound("Supplier not found");

    return ok({
      ...supplier,
      createdAt: supplier.createdAt.toISOString(),
      totalApplications: supplier._count.applications,
    });
  } catch (e) {
    console.error("[GET /api/supplier/profile]", e);
    return err("Failed to fetch profile", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const {
      name,
      phone,
      address,
      logo,
      description,
      website,
      currentPassword,
      newPassword,
    } = await req.json();

    const supplier = await prisma.supplier.findUnique({ where: { id: session.sub } });
    if (!supplier) return notFound("Supplier not found");

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (logo !== undefined) data.logo = logo;
    if (description !== undefined) data.description = description;
    if (website !== undefined) data.website = website;

    if (newPassword) {
      if (!currentPassword) return err("Current password is required");
      const valid = await bcrypt.compare(currentPassword, supplier.passwordHash);
      if (!valid) return err("Current password is incorrect");
      data.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    }

    const updated = await prisma.supplier.update({
      where: { id: session.sub },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        phone: true,
        address: true,
        logo: true,
        description: true,
        website: true,
        priceMultiplier: true,
        rating: true,
      },
    });

    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/supplier/profile]", e);
    return err("Failed to update profile", 500);
  }
}
