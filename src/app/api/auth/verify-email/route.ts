import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { parseRequestBody, verifyEmailSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseRequestBody(req, verifyEmailSchema);
    if (!parsed.success) return err(parsed.error);
    const { token } = parsed.data;

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!record) return err("Invalid or expired verification link", 400);
    if (record.expiresAt < new Date()) return err("Verification link has expired. Request a new one.", 400);

    if (record.user.emailVerified) {
      if (!record.usedAt) {
        await prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });
      }
      return ok({ message: "Email already verified" });
    }

    if (record.usedAt) return ok({ message: "Email already verified" });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      });
      await tx.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      await tx.emailVerificationToken.deleteMany({
        where: { userId: record.userId, usedAt: null },
      });
    });

    return ok({ message: "Email verified successfully" });
  } catch (e) {
    console.error("[POST /api/auth/verify-email]", e);
    return err("Verification failed", 500);
  }
}
