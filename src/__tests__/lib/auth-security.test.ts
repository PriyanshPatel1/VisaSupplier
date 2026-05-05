import { describe, it, expect } from "@jest/globals";
import { createPasswordResetToken, hashPasswordResetToken, BCRYPT_ROUNDS } from "@/lib/auth-security";

describe("auth-security", () => {
  it("generates a 64-char hex token", () => {
    const { token } = createPasswordResetToken();
    expect(token).toHaveLength(64); // 32 bytes hex
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });

  it("hashes token deterministically", () => {
    const { token } = createPasswordResetToken();
    const hash1 = hashPasswordResetToken(token);
    const hash2 = hashPasswordResetToken(token);
    expect(hash1).toBe(hash2);
  });

  it("generates unique tokens each call", () => {
    const { token: t1 } = createPasswordResetToken();
    const { token: t2 } = createPasswordResetToken();
    expect(t1).not.toBe(t2);
  });

  it("token and tokenHash differ", () => {
    const { token, tokenHash } = createPasswordResetToken();
    expect(token).not.toBe(tokenHash);
  });

  it("BCRYPT_ROUNDS is production-safe (≥12)", () => {
    expect(BCRYPT_ROUNDS).toBeGreaterThanOrEqual(12);
  });
});
