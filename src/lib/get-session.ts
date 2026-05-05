// Server-side session helper — use inside API Route Handlers and Server Components
import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./jwt";
import { COOKIE_NAMES } from "./auth-cookies";

export async function getUserSession(): Promise<JWTPayload | null> {
  // Keep route-level JWT verification even with proxy/middleware checks for defense in depth.
  const store = await cookies();
  const token = store.get(COOKIE_NAMES.USER)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminSession(): Promise<JWTPayload | null> {
  // Keep route-level JWT verification even with proxy/middleware checks for defense in depth.
  const store = await cookies();
  const token = store.get(COOKIE_NAMES.ADMIN)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function getSupplierSession(): Promise<JWTPayload | null> {
  // Keep route-level JWT verification even with proxy/middleware checks for defense in depth.
  const store = await cookies();
  const token = store.get(COOKIE_NAMES.SUPPLIER)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "SUPPLIER") return null;
  return payload;
}
