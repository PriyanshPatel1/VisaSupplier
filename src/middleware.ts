import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { COOKIE_NAMES } from "@/lib/auth-cookies";
import { ensureCsrfCookie, handleCsrf } from "@/lib/csrf";
import { matchesAnyRoutePrefix, matchesRoutePrefix } from "@/lib/route-prefix";

// 1. Constants & Route Definitions
const USER_ROUTES = ["/user", "/apply"];
const ADMIN_ROUTES = ["/admin"];
const SUPPLIER_ROUTES = ["/supplier"];

/**
 * Middleware Logic
 */
export async function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl;

      // Helper to attach CSRF to any response
      const withCsrf = (response: NextResponse) => {
            ensureCsrfCookie(request, response);
            return response;
      };

      // 2. Optimization: Skip middleware for static assets and public health checks
      if (
            pathname === "/api/health" ||
            pathname === "/api/docs" ||
            pathname.startsWith("/api/v1") ||
            pathname.startsWith("/_next") ||
            pathname.startsWith("/api/auth") ||
            pathname.includes(".") // Catches favicon.ico, images, etc.
      ) {
            return NextResponse.next();
      }

      // 3. User Route Protection
      if (matchesAnyRoutePrefix(pathname, USER_ROUTES)) {
            const token = request.cookies.get(COOKIE_NAMES.USER)?.value;
            const payload = await verifyToken(token ?? "").catch(() => null);

            if (!payload || payload.role !== "USER") {
                  const loginUrl = new URL("/login", request.url);
                  loginUrl.searchParams.set("redirect", pathname);
                  return withCsrf(NextResponse.redirect(loginUrl));
            }

            const response = NextResponse.next();
            response.headers.set("x-user-id", payload.sub as string);
            response.headers.set("x-user-email", payload.email as string);
            return withCsrf(response);
      }

      // 4. Admin Route Protection
      if (matchesAnyRoutePrefix(pathname, ADMIN_ROUTES)) {
            if (pathname === "/admin/login") return withCsrf(NextResponse.next());

            const token = request.cookies.get(COOKIE_NAMES.ADMIN)?.value;
            const payload = await verifyToken(token ?? "").catch(() => null);

            if (!payload || payload.role !== "ADMIN") {
                  return withCsrf(NextResponse.redirect(new URL("/admin/login", request.url)));
            }

            const response = NextResponse.next();
            response.headers.set("x-user-id", payload.sub as string);
            return withCsrf(response);
      }

      // 5. Supplier Route Protection
      if (matchesAnyRoutePrefix(pathname, SUPPLIER_ROUTES)) {
            if (pathname === "/supplier/login") return withCsrf(NextResponse.next());

            const token = request.cookies.get(COOKIE_NAMES.SUPPLIER)?.value;
            const payload = await verifyToken(token ?? "").catch(() => null);

            if (!payload || payload.role !== "SUPPLIER") {
                  return withCsrf(NextResponse.redirect(new URL("/supplier/login", request.url)));
            }

            const response = NextResponse.next();
            response.headers.set("x-user-id", payload.sub as string);
            return withCsrf(response);
      }

      // 6. API Route Protection & CSRF
      if (pathname.startsWith("/api/")) {
            const baseResponse = NextResponse.next();
            const csrfError = await handleCsrf(request, baseResponse);
            if (csrfError) return withCsrf(csrfError);

            // Admin API Check
            if (matchesRoutePrefix(pathname, "/api/admin")) {
                  const token = request.cookies.get(COOKIE_NAMES.ADMIN)?.value;
                  const payload = await verifyToken(token ?? "").catch(() => null);
                  if (!payload || payload.role !== "ADMIN") {
                        return withCsrf(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
                  }
            }

            // Supplier API Check
            if (matchesRoutePrefix(pathname, "/api/supplier")) {
                  const token = request.cookies.get(COOKIE_NAMES.SUPPLIER)?.value;
                  const payload = await verifyToken(token ?? "").catch(() => null);
                  if (!payload || payload.role !== "SUPPLIER") {
                        return withCsrf(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
                  }
            }

            // General Authenticated User API Check
            const protectedUserApis = ["/api/user", "/api/applications", "/api/notifications", "/api/documents", "/api/upload"];
            if (matchesAnyRoutePrefix(pathname, protectedUserApis)) {
                  const token = request.cookies.get(COOKIE_NAMES.USER)?.value;
                  const payload = await verifyToken(token ?? "").catch(() => null);
                  if (!payload) {
                        return withCsrf(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
                  }
            }

            return withCsrf(baseResponse);
      }

      return withCsrf(NextResponse.next());
}

// 7. Configuration: Limits where the middleware runs for better performance
export const config = {
      matcher: [
            /*
             * Match all request paths except for the ones starting with:
             * - _next/static (static files)
             * - _next/image (image optimization files)
             * - favicon.ico (favicon file)
             * - public (public assets)
             */
            "/((?!_next/static|_next/image|favicon.ico|public/).*)",
      ],
};
