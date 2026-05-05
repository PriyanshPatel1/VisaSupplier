import { ok } from "@/lib/api-response";
import { COOKIE_NAMES, expiredCookieOptions } from "@/lib/auth-cookies";

export async function POST() {
  const response = ok({ message: "Logged out" });
  // Clear all three cookies — covers user, admin, supplier with one call
  response.cookies.set(COOKIE_NAMES.USER, "", expiredCookieOptions());
  response.cookies.set(COOKIE_NAMES.ADMIN, "", expiredCookieOptions());
  response.cookies.set(COOKIE_NAMES.SUPPLIER, "", expiredCookieOptions());
  return response;
}
