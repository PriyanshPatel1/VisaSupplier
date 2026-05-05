/**
 * Environment variable validation using Zod.
 * Throws at startup if any required variable is missing or malformed.
 * Import `env` instead of `process.env` everywhere.
 */
import { z } from "zod";

const serverSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  // Auth cookies
  COOKIE_SECRET: z.string().min(32).optional(),

  // Cloudinary
  CLOUDINARY_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().min(1).optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1).optional(),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // VirusTotal
  VIRUSTOTAL_API_KEY: z.string().optional(),

  // Prisma Accelerate
  ACCELERATE_URL: z.string().url().optional(),
}).superRefine((env, ctx) => {
  const hasSignedConfig =
    Boolean(env.CLOUDINARY_URL) ||
    Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
        env.CLOUDINARY_API_KEY &&
        env.CLOUDINARY_API_SECRET
    );

  const hasUnsignedAvatarConfig = Boolean(
    (env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      (env.CLOUDINARY_UPLOAD_PRESET || env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
  );

  if (!hasSignedConfig && !hasUnsignedAvatarConfig) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["CLOUDINARY_CLOUD_NAME"],
      message:
        "Provide either signed Cloudinary credentials or a cloud name plus upload preset.",
    });
  }
});

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:\n",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

// Only validate on server-side
export const env = typeof window === "undefined" ? validateEnv() : ({} as z.infer<typeof serverSchema>);
export type Env = z.infer<typeof serverSchema>;
