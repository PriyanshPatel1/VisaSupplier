import { ok } from "@/lib/api-response";
import { COOKIE_NAMES, expiredCookieOptions } from "@/lib/auth-cookies";

export async function POST() {
  const response = ok({ message: "Supplier logged out" });
  response.cookies.set(COOKIE_NAMES.SUPPLIER, "", expiredCookieOptions());
  return response;
}
