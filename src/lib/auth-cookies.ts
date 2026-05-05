// Centralized cookie helpers — used by API routes (server) and middleware (edge)
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const COOKIE_NAMES = {
  USER:     process.env.USER_COOKIE     ?? "visahub_user_token",
  ADMIN:    process.env.ADMIN_COOKIE    ?? "visahub_admin_token",
  SUPPLIER: process.env.SUPPLIER_COOKIE ?? "visahub_supplier_token",
} as const;

const IS_PROD = process.env.NODE_ENV === "production";

export function cookieOptions(rememberMe = false): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days or session
  };
}

// Expire a cookie (set maxAge=0)
export function expiredCookieOptions(): Partial<ResponseCookie> {
  return { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/", maxAge: 0 };
}
