import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { status: true, totalPaid: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = suppliers.map((supplier) => {
      const apps = supplier.applications;
      const approved = apps.filter((application) => application.status === "approved").length;
      const rejected = apps.filter((application) => application.status === "rejected").length;
      const processing = apps.filter((application) => application.status === "processing").length;
      const submitted = apps.filter((application) => application.status === "submitted").length;
      const revenue = apps.reduce((sum, application) => sum + application.totalPaid, 0);
      const totalApps = apps.length;
      const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;

      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        type: supplier.type,
        priceMultiplier: supplier.priceMultiplier,
        rating: supplier.rating,
        createdAt: supplier.createdAt.toISOString(),
        totalApps,
        approved,
        rejected,
        processing,
        submitted,
        revenue,
        approvalRate,
      };
    });

    return ok(data);
  } catch (e) {
    console.error("[GET /api/admin/suppliers]", e);
    return err("Failed to fetch suppliers", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { name, email, password, type, priceMultiplier, rating } = await req.json();

    if (!name || !email || !password) {
      return err("name, email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.supplier.findUnique({ where: { email: normalizedEmail } });
    if (existing) return err("Email already in use");

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        type: type ?? "agency",
        priceMultiplier: priceMultiplier ?? 1.0,
        rating: rating ?? 4.5,
      },
    });

    return ok(
      {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        type: supplier.type,
        priceMultiplier: supplier.priceMultiplier,
        rating: supplier.rating,
        createdAt: supplier.createdAt.toISOString(),
      },
      201,
    );
  } catch (e) {
    console.error("[POST /api/admin/suppliers]", e);
    return err("Failed to create supplier", 500);
  }
}
