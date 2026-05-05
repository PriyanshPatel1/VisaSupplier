import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/api-response";
import { applicationResponseInclude, serializeApplication } from "@/lib/application-serializer";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const [total, submitted, processing, approved, rejected, revenue, userCount, recentApps] =
    await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "submitted" } }),
      prisma.application.count({ where: { status: "processing" } }),
      prisma.application.count({ where: { status: "approved" } }),
      prisma.application.count({ where: { status: "rejected" } }),
      prisma.application.aggregate({ _sum: { totalPaid: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.application.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: applicationResponseInclude,
      }),
    ]);

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return ok({
    total,
    submitted,
    processing,
    approved,
    rejected,
    approvalRate,
    revenue: revenue._sum.totalPaid ?? 0,
    userCount,
    recentApps: recentApps.map((app) => serializeApplication(app)),
  });
}
