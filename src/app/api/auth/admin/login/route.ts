import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { COOKIE_NAMES } from "@/lib/auth-cookies";
import { adminLoginSchema, parseRequestBody } from "@/lib/validators";


export async function POST(req: NextRequest) {


  try {
    const parsed = await parseRequestBody(req, adminLoginSchema);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    // 🔒 Do NOT reveal which condition failed
    if (
      !admin ||
      admin.role !== "ADMIN" ||
      !admin.isActive ||
      !admin.emailVerified
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Update last login
    await prisma.user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // 🔐 Generate JWT
    const token = await signToken(
      {
        sub: admin.id,
        email: admin.email,
        role: "ADMIN",
        name: admin.name,
      },
      "8h"
    );

    // 🍪 Set secure cookie
    const { ok } = await import("@/lib/api-response");
    const res = ok({ id: admin.id, name: admin.name, email: admin.email });

    res.cookies.set(COOKIE_NAMES.ADMIN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (error) {
    console.error("[ADMIN_LOGIN_ERROR]", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
