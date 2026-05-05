import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";
import { changePasswordSchema, parseRequestBody } from "@/lib/validators";

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const parsed = await parseRequestBody(req, changePasswordSchema);
    if (!parsed.success) return err(parsed.error);
    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return unauthorized();

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return err("Current password is incorrect", 401);

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({ where: { id: session.sub }, data: { passwordHash } });

    return ok({ message: "Password updated successfully" });
  } catch (e) {
    console.error("[PATCH /api/user/password]", e);
    return err("Failed to update password", 500);
  }
}
