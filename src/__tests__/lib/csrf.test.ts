import { describe, expect, it } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { handleCsrf } from "@/lib/csrf";

describe("handleCsrf", () => {
  it("sets csrf cookie on safe API requests when missing", async () => {
    const request = new NextRequest("http://localhost/api/test", { method: "GET" });
    const response = NextResponse.next();

    const result = await handleCsrf(request, response);

    expect(result).toBeNull();
    expect(response.cookies.get("csrf-token")?.value).toBeTruthy();
  });

  it("returns 403 and sets csrf cookie on first mutation without token", async () => {
    const request = new NextRequest("http://localhost/api/test", { method: "POST" });
    const response = NextResponse.next();

    const result = await handleCsrf(request, response);

    expect(result?.status).toBe(403);
    expect(result?.cookies.get("csrf-token")?.value).toBeTruthy();
  });

  it("allows mutation when cookie token matches header token", async () => {
    const token = "known-test-token";
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      },
    });
    const response = NextResponse.next();

    const result = await handleCsrf(request, response);

    expect(result).toBeNull();
  });
});
