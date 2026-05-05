import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

    const where: Record<string, unknown> = { role: "USER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({
      users: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/admin/users]", e);
    return err("Failed to fetch users", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { name, email, password, phone, country, nationality } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return err("name, email, and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return err("Email already registered");

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        // BUG FIX: admin-created accounts were not verified/active by default —
        // users could not log in until they verified email (no email was sent either)
        emailVerified: true,
        isActive: true,
        phone: phone ?? null,
        country: country ?? null,
        nationality: nationality ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        country: true,
        nationality: true,
        createdAt: true,
      },
    });

    return ok({ ...user, createdAt: user.createdAt.toISOString() }, 201);
  } catch (e) {
    console.error("[POST /api/admin/users]", e);
    return err("Failed to create user", 500);
  }
}
