/**
 * NOTE: Supplier password reset uses the same PasswordResetToken model as users
 * but tracks via a `supplierEmail` field convention stored in the `token` metadata.
 *
 * Simpler approach: add a SupplierPasswordResetToken model in Prisma (mirrors
 * PasswordResetToken with supplierId instead of userId). Migration required.
 *
 * This route implements the reset using a separate in-DB token keyed by supplierId.
 * Requires adding to prisma/schema.prisma:
 *
 * model SupplierPasswordResetToken {
 *   id         String   @id @default(auto()) @map("_id") @db.ObjectId
 *   supplierId String   @db.ObjectId
 *   token      String   @unique   // SHA-256 hash of the raw token
 *   expiresAt  DateTime
 *   usedAt     DateTime?
 *   createdAt  DateTime @default(now())
 *   supplier   Supplier @relation(fields: [supplierId], references: [id])
 * }
 *
 * And on Supplier model add: passwordResetTokens SupplierPasswordResetToken[]
 *
 * Run: npx prisma db push
 */

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

    const tokenHash = hashPasswordResetToken(token);

    // SupplierPasswordResetToken model not yet in schema — return 501 until migration is run
    // See file header for instructions to add this model to prisma/schema.prisma
    return err(
      "Supplier password reset is not yet available. Please contact support to reset your password.",
      501
    );

    /* eslint-disable no-unreachable */
    // @ts-expect-error — add SupplierPasswordResetToken to prisma schema first (see file header)
    const record = await prisma.supplierPasswordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) return err("Invalid or expired reset token", 400);
    if (record.usedAt) return err("This reset token has already been used", 400);
    if (record.expiresAt < new Date()) {
      return err("Reset token has expired. Please request a new one.", 400);
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: record.supplierId } });
    if (!supplier) return err("Supplier not found", 404);

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await Promise.all([
      prisma.supplier.update({ where: { id: record.supplierId }, data: { passwordHash } }),
      // @ts-expect-error — same as above
      prisma.supplierPasswordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await prisma.supplierNotification.create({
      data: {
        supplierId: record.supplierId,
        title: "Password Changed",
        message:
          "Your password was successfully reset. If you did not do this, contact support immediately.",
        type: "success",
      },
    });

    return ok({ message: "Password reset successfully. You can now log in." });
  } catch (e) {
    console.error("[POST /api/auth/supplier/reset-password]", e);
    return err("Failed to reset password", 500);
  }
}
