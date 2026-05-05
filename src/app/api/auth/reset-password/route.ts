import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { BCRYPT_ROUNDS, hashPasswordResetToken } from "@/lib/auth-security";
import { parseRequestBody, resetPasswordSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseRequestBody(req, resetPasswordSchema);
    if (!parsed.success) return err(parsed.error);
    const { token, password } = parsed.data;

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: hashPasswordResetToken(token) },
    });

    if (!record) return err("Invalid or expired reset token", 400);
    if (record.usedAt) return err("This reset token has already been used", 400);
    if (record.expiresAt < new Date()) {
      return err("Reset token has expired. Please request a new one.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return err("User not found", 404);

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await Promise.all([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: record.userId,
        title: "Password Changed",
        message:
          "Your password was successfully reset. If you did not do this, contact support immediately.",
        type: "success",
      },
    });

    return ok({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (e) {
    console.error("[POST /api/auth/reset-password]", e);
    return err("Failed to reset password", 500);
  }
}
