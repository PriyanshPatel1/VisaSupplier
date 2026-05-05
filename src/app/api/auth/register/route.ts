// import { NextRequest } from "next/server";
// import bcrypt from "bcryptjs";
// import { createHash, randomBytes } from "crypto";
// import { prisma } from "@/lib/prisma";
// import { ok, err } from "@/lib/api-response";
// import { BCRYPT_ROUNDS } from "@/lib/auth-security";
// import { sendEmail } from "@/lib/email";
// import { parseRequestBody, registerSchema } from "@/lib/validators";

// export async function POST(req: NextRequest) {

//   try {
//     const parsed = await parseRequestBody(req, registerSchema);
//     if (!parsed.success) return err(parsed.error);
//     const { name, email, password } = parsed.data;

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) return err("An account with this email already exists");

//     const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

//     const user = await prisma.user.create({
//       data: { name, email, passwordHash, role: "USER" },
//     });

//     // Send verification email — login is blocked until email is verified
//     const verifyToken = randomBytes(32).toString("hex");
//     const tokenHash = createHash("sha256").update(verifyToken).digest("hex");
//     const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

//     await prisma.emailVerificationToken.create({
//       data: { userId: user.id, token: tokenHash, expiresAt },
//     });

//     const appUrl =
//       process.env.APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
//     const verifyUrl = `${appUrl}/verify-email?token=${verifyToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: "Verify your VisaHub email",
//       html: `<p>Welcome to VisaHub, ${user.name}!</p><p>Click the link below to verify your email. It expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
//       text: `Welcome to VisaHub! Verify your email: ${verifyUrl}`,
//     });

//     // Do NOT set auth cookie — login requires email verification first
//     return ok(
//       {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         message: "Account created. Please verify your email before logging in.",
//       },
//       201
//     );
//   } catch (e) {
//     console.error("[POST /api/auth/register]", e);
//     return err("Registration failed. Please try again.", 500);
//   }
// }

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { BCRYPT_ROUNDS } from "@/lib/auth-security";
import { sendEmail } from "@/lib/email";
import {
  parseRequestBody,
  registerSchema,
} from "@/lib/validation/auth";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseRequestBody(req, registerSchema);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error,
          fieldErrors: parsed.fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, avatar, phone, country, nationality, dob, gender } =
      parsed.data;

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "USER",

          avatar: avatar ?? null,
          phone: phone ?? null,
          country: country ?? null,
          nationality: nationality ?? null,
          dob: dob ?? null,
          gender: gender ?? null,
        },
      });

      await tx.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });

      const rawToken = randomBytes(32).toString("hex");

      const tokenHash = createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: tokenHash,
          expiresAt,
        },
      });

      return { user, rawToken };
    });

    const appUrl =
      process.env.APP_URL ??
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const verifyUrl = `${appUrl}/verify-email?token=${result.rawToken}`;

    let emailSent = true;
    let message = "Account created. Please verify your email before logging in.";

    try {
      await sendEmail({
        to: result.user.email,
        subject: "Verify your VisaHub email",
        html: `
          <p>Welcome to VisaHub, ${result.user.name}!</p>
          <p>Please verify your email:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link expires in 24 hours.</p>
        `,
        text: `Verify your email: ${verifyUrl}`,
      });
    } catch (emailError) {
      emailSent = false;
      message =
        "Account created, but we could not send your verification email. Please request a new verification link before signing in.";
      console.error("REGISTER_EMAIL_SEND_ERROR", {
        email: result.user.email,
        error: emailError,
      });
    }

    return ok(
      {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
        emailSent,
        message,
      },
      201
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return err("An account with this email already exists", 409);
      }
    }

    console.error("REGISTER_API_ERROR", e);

    return err("Registration failed. Please try again.", 500);
  }
}
