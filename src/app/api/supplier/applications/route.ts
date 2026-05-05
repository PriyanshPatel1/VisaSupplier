import { AppStatus, Prisma } from "@prisma/client";
import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";

export async function GET(req: Request) {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.ApplicationWhereInput = { supplierId: session.sub };
  if (status && status !== "all") {
    const validStatuses: AppStatus[] = [
      "draft",
      "submitted",
      "processing",
      "approved",
      "rejected",
      "cancelled",
    ];
    if (validStatuses.includes(status as AppStatus)) {
      where.status = status as AppStatus;
    }
  }
  if (q) {
    where.OR = [
      { visaName: { contains: q, mode: "insensitive" } },
      { countryName: { contains: q, mode: "insensitive" } },
      { user: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [apps, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: applicationResponseInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return ok({
    apps: apps.map((app) => serializeApplication(app)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}
