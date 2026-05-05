import crypto from "crypto";

export const BCRYPT_ROUNDS = 12;

export function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
  };
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}
