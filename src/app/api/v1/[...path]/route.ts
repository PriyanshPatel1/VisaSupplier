/**
 * /api/v1/[...path] — catch-all proxy
 *
 * Rewrites /api/v1/foo/bar → /api/foo/bar and adds versioning headers.
 * No logic changes — same handlers, same auth, new URL namespace.
 */

import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, path: string): Promise<NextResponse> {
  const targetUrl = new URL(req.url);
  // Replace /api/v1/ with /api/
  targetUrl.pathname = targetUrl.pathname.replace(/^\/api\/v1\//, "/api/");

  const headers = new Headers(req.headers);
  headers.set("x-api-version", "v1");

  const proxied = new NextRequest(targetUrl, {
    method: req.method,
    headers,
    body: req.body,
  });

  // Next.js route handlers are called directly in the same process
  // Re-fetch internally to hit the existing route handlers
  const res = await fetch(targetUrl.toString(), {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error — Node fetch duplex
    duplex: "half",
  });

  const response = new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });

  // Versioning response headers
  response.headers.set("x-api-version", "v1");
  response.headers.set("x-api-deprecated", "false");

  return response;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}
