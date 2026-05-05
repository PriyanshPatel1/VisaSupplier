import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api-response";
import { COOKIE_NAMES, cookieOptions } from "@/lib/auth-cookies";
import { parseRequestBody, supplierLoginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {

  try {
    const parsed = await parseRequestBody(req, supplierLoginSchema);
    if (!parsed.success) return err(parsed.error);
    const { email, password } = parsed.data;

    const supplier = await prisma.supplier.findUnique({
      where: { email },
    });

    if (!supplier) return err("Invalid credentials", 401);

    if (!supplier.isActive) {
      return err("Account has been deactivated. Contact support.", 403);
    }

    const valid = await bcrypt.compare(password, supplier.passwordHash);
    if (!valid) return err("Invalid credentials", 401);

    // Fix 8: update lastLoginAt
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signToken(
      { sub: supplier.id, email: supplier.email, role: "SUPPLIER", name: supplier.name },
      "24h"
    );

    const response = ok({ id: supplier.id, name: supplier.name, email: supplier.email });
    response.cookies.set(COOKIE_NAMES.SUPPLIER, token, cookieOptions());
    return response;
  } catch (e) {
    console.error("[POST /api/auth/supplier/login]", e);
    return err("Login failed", 500);
  }
}
