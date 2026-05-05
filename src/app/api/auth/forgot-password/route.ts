// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ok, err } from "@/lib/api-response";
// import { createPasswordResetToken } from "@/lib/auth-security";
// import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
// import { forgotPasswordSchema, parseRequestBody } from "@/lib/validators";

// export async function POST(req: NextRequest) {


//   try {
//     const parsed = await parseRequestBody(req, forgotPasswordSchema);
//     if (!parsed.success) return err(parsed.error);
//     const { email: normalizedEmail } = parsed.data;

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//       select: { id: true, email: true },
//     });

//     // Always return the same message — prevents user enumeration
//     if (!user) {
//       return ok({ message: "If that email exists, a reset link has been sent." });
//     }

//     const { token, tokenHash } = createPasswordResetToken();
//     const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

//     // Invalidate any existing unused tokens for this user
//     await prisma.passwordResetToken.deleteMany({
//       where: { userId: user.id, usedAt: null },
//     });

//     await prisma.passwordResetToken.create({
//       data: {
//         userId: user.id,
//         token: tokenHash,
//         expiresAt,
//         ipAddress: req.headers.get("x-forwarded-for") ?? null,
//         userAgent: req.headers.get("user-agent") ?? null,
//       },
//     });

//     // Build reset URL — use APP_URL env var or fall back to request origin
//     const appUrl =
//       process.env.APP_URL ??
//       `${req.nextUrl.protocol}//${req.nextUrl.host}`;
//     const resetUrl = `${appUrl}/forgot-password?token=${token}`;

//     // Send email — the user is locked out so a DB notification is useless
//     const emailContent = buildPasswordResetEmail(resetUrl);
//     await sendEmail({ to: user.email, ...emailContent });

//     return ok({ message: "If that email exists, a reset link has been sent." });
//   } catch (e) {
//     console.error("[POST /api/auth/forgot-password]", e);
//     return err("Failed to process request", 500);
//   }
// }
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { forgotPasswordSchema, parseRequestBody } from "@/lib/validators";
import crypto from "crypto";

export const runtime = "nodejs";

function generateOTP() {
  // BUG FIX: Math.random() is not cryptographically secure — OTPs were predictable
  // crypto.randomInt is CSPRNG-backed and safe for security tokens
  return crypto.randomInt(100000, 1000000).toString();
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseRequestBody(req, forgotPasswordSchema);
    if (!parsed.success) return err(parsed.error);

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Prevent user enumeration
    if (!user) {
      return ok({ message: "If that email exists, a code has been sent." });
    }

    const otp = generateOTP();
    const otpHash = hashToken(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // delete old unused OTPs
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: otpHash,
        expiresAt,
      },
    });

    // send OTP email
    await sendEmail({
      to: user.email,
      subject: "Your Password Reset Code",
      html: `<p>Your password reset code is:</p>
             <h2>${otp}</h2>
             <p>This code will expire in 10 minutes.</p>`,
    });

    return ok({
      message: "If that email exists, a code has been sent.",
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    return err("Failed to process request", 500);
  }
}