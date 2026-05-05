/**
 * CSRF protection for state-mutating API routes.
 *
 * Strategy: Double-Submit Cookie Pattern
 *  1. On first request, generate a random token stored in a cookie (csrf-token).
 *  2. Client reads cookie and sends token as header (x-csrf-token) on mutations.
 *  3. Server compares header value against cookie value — must match.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 * Excluded: /api/payments/webhook (uses Razorpay signature auth instead).
 *
 * Usage in middleware.ts — call validateCsrf(request) before processing mutations.
 */

import { NextRequest, NextResponse } from "next/server";

// Uses Web Crypto API — fully supported in Edge Runtime (no Node.js crypto import needed)

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Routes exempt from CSRF (they have their own auth: webhook signature, etc.) */
const CSRF_EXEMPT = [
  "/api/payments/webhook",
  "/api/auth/", // Auth endpoints use same-site cookies + rate limiting
];

function isCsrfExempt(pathname: string): boolean {
  return CSRF_EXEMPT.some((p) => pathname.startsWith(p));
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ensureCsrfCookie(
  request: NextRequest,
  response: NextResponse
): void {
  const existingToken = request.cookies.get(CSRF_COOKIE)?.value;
  if (existingToken) return;

  response.cookies.set(CSRF_COOKIE, generateToken(), {
    httpOnly: false, // Must be readable by JS to set as header
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 86400, // 24h
  });
}

async function hmacToken(token: string): Promise<string> {
  const secret =
    process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? "fallback-csrf-secret";
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(token));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison using XOR — safe for fixed-length hex strings */
function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

/**
 * Call from middleware on every API request.
 * Returns null if OK, or a 403 Response if CSRF check fails.
 * Also sets the CSRF cookie on the response when needed.
 */
export async function handleCsrf(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only check API routes
  if (!pathname.startsWith("/api/")) return null;

  // Exempt routes
  if (isCsrfExempt(pathname)) return null;

  // Ensure CSRF cookie exists on the response so the browser can bootstrap.
  ensureCsrfCookie(request, response);

  // Only validate on mutations
  if (SAFE_METHODS.has(request.method)) return null;

  // Validate token
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value ?? "";
  const headerToken = request.headers.get(CSRF_HEADER) ?? "";

  if (!cookieToken || !headerToken) {
    const errorResponse = NextResponse.json(
      { ok: false, error: "CSRF token invalid or missing" },
      { status: 403 }
    );
    ensureCsrfCookie(request, errorResponse);
    return errorResponse;
  }

  const [cookieHmac, headerHmac] = await Promise.all([
    hmacToken(cookieToken),
    hmacToken(headerToken),
  ]);

  if (!timingSafeStringEqual(cookieHmac, headerHmac)) {
    const errorResponse = NextResponse.json(
      { ok: false, error: "CSRF token invalid or missing" },
      { status: 403 }
    );
    ensureCsrfCookie(request, errorResponse);
    return errorResponse;
  }

  return null;
}

/**
 * Client-side utility: read the CSRF token cookie and attach to fetch requests.
 *
 * Usage:
 *   import { csrfHeaders } from "@/lib/csrf";
 *   fetch("/api/...", { method: "POST", headers: { ...csrfHeaders(), "Content-Type": "application/json" } })
 */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER]: token } : {};
}
