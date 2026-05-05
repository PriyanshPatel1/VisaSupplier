import { describe, it, expect } from "@jest/globals";
import { signToken, verifyToken } from "@/lib/jwt";

const payload = { sub: "user123", email: "a@b.com", role: "USER" as const, name: "Test" };

describe("JWT", () => {
  it("signs and verifies a token", async () => {
    const token = await signToken(payload);
    const verified = await verifyToken(token);
    expect(verified?.sub).toBe("user123");
    expect(verified?.email).toBe("a@b.com");
    expect(verified?.role).toBe("USER");
  });

  it("returns null for invalid token", async () => {
    const result = await verifyToken("invalid.token.here");
    expect(result).toBeNull();
  });

  it("returns null for expired token", async () => {
    const token = await signToken(payload, "1ms");
    await new Promise((r) => setTimeout(r, 10));
    const result = await verifyToken(token);
    expect(result).toBeNull();
  });

  it("respects custom expiry", async () => {
    const token = await signToken(payload, "30d");
    const verified = await verifyToken(token);
    const exp = verified?.exp ?? 0;
    const iat = verified?.iat ?? 0;
    // Should be ~30 days
    expect(exp - iat).toBeGreaterThan(29 * 24 * 3600);
  });
});
