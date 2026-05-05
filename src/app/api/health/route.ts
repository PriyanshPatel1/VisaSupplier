import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Production health-check endpoint.
 * Returns 200 when DB is reachable, 503 otherwise.
 * Used by load-balancers (Render / Railway / Vercel) and uptime monitors.
 * NOTE: version is intentionally omitted to avoid leaking info to attackers.
 */
export async function GET() {
  const start = Date.now();

  try {
    await prisma.adminConfig.count();
    const latencyMs = Date.now() - start;

    return NextResponse.json(
      { status: "ok", db: "connected", latencyMs, ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/health] DB check failed:", err);
    return NextResponse.json(
      { status: "error", db: "unreachable", ts: new Date().toISOString() },
      { status: 503 }
    );
  }
}
