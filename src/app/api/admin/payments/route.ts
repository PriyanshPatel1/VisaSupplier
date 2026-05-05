import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q");
    const status = searchParams.get("status");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { visaName: { contains: search, mode: "insensitive" } },
        { countryName: { contains: search, mode: "insensitive" } },
        { user: { is: { name: { contains: search, mode: "insensitive" } } } },
        { user: { is: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [apps, total, totalRevenue] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          supplier: { select: { name: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
      prisma.application.aggregate({ _sum: { totalPaid: true } }),
    ]);

    const payments = apps.map((app) => ({
      id: app.id,
      visaName: app.visaName,
      countryName: app.countryName,
      countryCode: app.countryCode,
      totalPaid: app.totalPaid,
      status: app.status,
      submittedAt: app.submittedAt?.toISOString() ?? app.createdAt.toISOString(),
      userName: app.user.name,
      userEmail: app.user.email,
      supplierName: app.supplier.name,
      supplierType: app.supplier.type,
    }));

    return ok({
      payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      totalRevenue: totalRevenue._sum.totalPaid ?? 0,
    });
  } catch (e) {
    console.error("[GET /api/admin/payments]", e);
    return err("Failed to fetch payments", 500);
  }
}
