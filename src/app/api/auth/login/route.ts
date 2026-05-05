import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api-response";
import { COOKIE_NAMES, cookieOptions } from "@/lib/auth-cookies";
import { loginSchema, parseRequestBody } from "@/lib/validators";


export async function POST(req: NextRequest) {

  try {
    const parsed = await parseRequestBody(req, loginSchema);
    if (!parsed.success) return err(parsed.error);
    const { email, password, rememberMe } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "USER") {
      return err("Invalid email or password", 401);
    }

    if (!user.isActive) {
      return err("Account has been deactivated. Contact support.", 403);
    }

    // FIX: emailVerified was stored but never checked — unverified users could log in freely
    if (!user.emailVerified) {
      return err(
        "Please verify your email address before logging in. Check your inbox for the verification link.",
        403
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return err("Invalid email or password", 401);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // FIX: JWT expiry matches cookie maxAge — was 7d JWT vs 30d cookie when rememberMe=true
    const tokenExpiry = rememberMe ? "30d" : "7d";
    const token = await signToken(
      { sub: user.id, email: user.email, role: "USER", name: user.name },
      tokenExpiry
    );

    const response = ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      country: user.country,
      nationality: user.nationality,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
    });

    response.cookies.set(COOKIE_NAMES.USER, token, cookieOptions(rememberMe));
    return response;
  } catch (e) {
    console.error("[POST /api/auth/login]", e);
    return err("Login failed. Please try again.", 500);
  }
}
