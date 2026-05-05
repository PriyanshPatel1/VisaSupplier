/**
 * API versioning entry — /api/v1/*
 *
 * All existing /api/* routes are re-exported under /api/v1/* for
 * versioned consumers (mobile apps, third-party integrations).
 *
 * Current routes proxy to the same handlers.
 * When breaking changes are needed, add /api/v2/* with new handlers
 * and deprecate v1 with Sunset header.
 *
 * This file serves as the version manifest.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "v1",
    status: "stable",
    deprecationDate: null,
    routes: {
      auth: {
        login: "POST /api/v1/auth/login",
        register: "POST /api/v1/auth/register",
        logout: "POST /api/v1/auth/logout",
        me: "GET /api/v1/auth/me",
        forgotPassword: "POST /api/v1/auth/forgot-password",
        resetPassword: "POST /api/v1/auth/reset-password",
        verifyEmail: "POST /api/v1/auth/verify-email",
      },
      applications: {
        list: "GET /api/v1/applications",
        create: "POST /api/v1/applications",
        get: "GET /api/v1/applications/:id",
        update: "PATCH /api/v1/applications/:id",
      },
      payments: {
        createOrder: "POST /api/v1/payments/create-order",
        verify: "POST /api/v1/payments/verify",
        webhook: "POST /api/v1/payments/webhook",
      },
      content: {
        catalog: "GET /api/v1/content/catalog",
        site: "GET /api/v1/content/site",
      },
      documents: {
        list: "GET /api/v1/documents",
        upload: "POST /api/v1/upload",
      },
      health: "GET /api/v1/health",
      docs: "GET /api/v1/docs",
    },
  });
}
