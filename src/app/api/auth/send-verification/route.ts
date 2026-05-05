import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { parseRequestBody, sendVerificationSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseRequestBody(req, sendVerificationSchema);
    if (!parsed.success) return err(parsed.error);
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true },
    });

    // Always return same message to prevent enumeration
    if (!user || user.emailVerified) {
      return ok({ message: "If that email is registered and unverified, a verification link has been sent." });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });
      await tx.emailVerificationToken.create({
        data: { userId: user.id, token: tokenHash, expiresAt },
      });
    });

    const appUrl = process.env.APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your VisaHub email",
        html: `<p>Click the link below to verify your email. It expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        text: `Verify your email: ${verifyUrl}`,
      });
    } catch (emailError) {
      console.error("[POST /api/auth/send-verification] email send failed", {
        email: user.email,
        error: emailError,
      });
      return err(
        "We could not send a verification email right now. Please try again in a moment.",
        503
      );
    }

    return ok({ message: "If that email is registered and unverified, a verification link has been sent." });
  } catch (e) {
    console.error("[POST /api/auth/send-verification]", e);
    return err("Failed to send verification email", 500);
  }
}
