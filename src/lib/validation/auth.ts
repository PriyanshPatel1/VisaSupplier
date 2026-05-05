import { z } from "zod";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Normalize phone (basic cleanup)
const normalizePhone = (phone: string) =>
  phone.replace(/\s+/g, "");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100)
  .regex(/^[a-zA-Z\s.'-]+$/, "Invalid name format");

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform(normalizeEmail);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const avatarSchema = z
  .string()
  .url("Invalid avatar URL")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      const pathMatchesCloud =
        !CLOUD_NAME || parsed.pathname.startsWith(`/${CLOUD_NAME}/`);

      return (
        parsed.hostname === "res.cloudinary.com" &&
        pathMatchesCloud &&
        parsed.pathname.includes("/image/upload/") &&
        parsed.pathname.includes("/avatars/") &&
        /\.(jpg|jpeg|png|webp)$/i.test(parsed.pathname)
      );
    } catch {
      return false;
    }
  }, "Invalid avatar source")
  .optional();

const phoneSchema = z
  .string()
  .min(6)
  .max(20)
  .transform(normalizePhone)
  .refine((phone) => /^[0-9+()-]+$/.test(phone), {
    message: "Invalid phone number",
  })
  .optional();

const countrySchema = z
  .string()
  .min(2, "Country is too short")
  .max(100)
  .optional();

const nationalitySchema = z
  .string()
  .min(2, "Nationality is too short")
  .max(100)
  .optional();

const dobSchema = z
  .coerce
  .date()
  .refine((date) => date <= new Date(), {
    message: "Date of birth cannot be in the future",
  })
  .refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 13;
  }, {
    message: "You must be at least 13 years old",
  })
  .optional();

const GENDER_CANONICAL_VALUES = [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
  "other",
] as const;

const normalizeGender = (value: string) =>
  value.trim().toLowerCase().replace(/[\s-]+/g, "_");

const genderSchema = z
  .string()
  .transform(normalizeGender)
  .refine((val): val is (typeof GENDER_CANONICAL_VALUES)[number] => {
    return GENDER_CANONICAL_VALUES.includes(
      val as (typeof GENDER_CANONICAL_VALUES)[number]
    );
  }, {
    message: "Invalid gender",
  })
  .optional();

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Verification token is required"),
}).strict();
/**
 * -------------------------------------------------------
 * Register Schema
 * -------------------------------------------------------
 */

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,

    avatar: avatarSchema,
    phone: phoneSchema,
    country: countrySchema,
    nationality: nationalitySchema,
    dob: dobSchema,
    gender: genderSchema,
  })
  .strict();

/**
 * -------------------------------------------------------
 * Login Schema
 * -------------------------------------------------------
 */

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();

export const adminLoginSchema = loginSchema;

export const supplierLoginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required"),
    password: passwordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .strict();

/**
 * -------------------------------------------------------
 * Types (IMPORTANT)
 * -------------------------------------------------------
 */

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * -------------------------------------------------------
 * Request Parsing Utility
 * -------------------------------------------------------
 */

export async function parseRequestBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  try {
    const body = await req.json();

    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: getZodErrorMessage(result.error),
        fieldErrors: getZodFieldErrors(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: "Invalid JSON body",
    };
  }
}

/**
 * -------------------------------------------------------
 * Error Formatter (API-friendly)
 * -------------------------------------------------------
 */

function getZodErrorMessage(error: z.ZodError): string {
  const first = error.errors[0];
  if (!first) return "Invalid input";
  return first.message;
}

export function getZodFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.errors) {
    const field = issue.path[0];
    if (field && !fieldErrors[field]) {
      fieldErrors[field.toString()] = issue.message;
    }
  }

  return fieldErrors;
}
