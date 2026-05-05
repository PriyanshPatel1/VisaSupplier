import { getSupplierSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSupplierSession();
  if (!session) return unauthorized();

  try {
    const supplierId = session.sub;

    const apps = await prisma.application.findMany({
      where: { supplierId },
      select: { status: true, totalPaid: true, submittedAt: true },
    });

    const total      = apps.length;
    const submitted  = apps.filter((a) => a.status === "submitted").length;
    const processing = apps.filter((a) => a.status === "processing").length;
    const approved   = apps.filter((a) => a.status === "approved").length;
    const rejected   = apps.filter((a) => a.status === "rejected").length;
    const revenue    = apps.reduce((sum, a) => sum + a.totalPaid, 0);
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Revenue last 6 months
    // BUG FIX: previous code used getMonth() only — broke at year boundaries.
    // e.g. Jan 2026 vs Jan 2025 gave mDiff=0 (treated as current month).
    // Fix: compute diff in whole months using full year×12 arithmetic.
    const revByMonth: number[] = Array(6).fill(0);
    const now = new Date();
    const nowMonths = now.getFullYear() * 12 + now.getMonth();

    apps.forEach((a) => {
      if (!a.submittedAt) return;
      const submitted = new Date(a.submittedAt);
      if (Number.isNaN(submitted.getTime())) return;

      const submittedMonths = submitted.getFullYear() * 12 + submitted.getMonth();
      const mDiff = nowMonths - submittedMonths;
      if (mDiff >= 0 && mDiff < 6) revByMonth[5 - mDiff] += a.totalPaid;
    });

    return ok({
      total,
      submitted,
      processing,
      approved,
      rejected,
      revenue,
      approvalRate,
      revByMonth,
    });
  } catch (e) {
    console.error("[GET /api/supplier/stats]", e);
    return err("Failed to fetch stats", 500);
  }
}
