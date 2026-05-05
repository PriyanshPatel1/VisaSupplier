import { describe, it, expect } from "@jest/globals";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  createOrderSchema,
  verifyPaymentSchema,
  parseBody,
} from "@/lib/validators";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("lowercases email", () => {
    const result = loginSchema.safeParse({ email: "USER@EXAMPLE.COM", password: "pass" });
    expect(result.success && result.data.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { name: "John Doe", email: "john@example.com", password: "Password1!" };

  it("accepts valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short password", () => {
    expect(registerSchema.safeParse({ ...valid, password: "abc" }).success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(registerSchema.safeParse({ ...valid, password: "password1" }).success).toBe(false);
  });

  it("rejects password without number", () => {
    expect(registerSchema.safeParse({ ...valid, password: "PasswordABC" }).success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  it("accepts a token-only payload", () => {
    expect(verifyEmailSchema.safeParse({ token: "abc123" }).success).toBe(true);
  });

  it("rejects a missing token", () => {
    expect(verifyEmailSchema.safeParse({}).success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  it("accepts positive amount", () => {
    expect(createOrderSchema.safeParse({ amount: 100 }).success).toBe(true);
  });

  it("rejects zero amount", () => {
    expect(createOrderSchema.safeParse({ amount: 0 }).success).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(createOrderSchema.safeParse({ amount: -50 }).success).toBe(false);
  });
});

describe("verifyPaymentSchema", () => {
  const valid = {
    razorpay_payment_id: "pay_abc123",
    razorpay_order_id: "order_xyz789",
    razorpay_signature: "sig_abc",
    amount: 500,
  };

  it("accepts valid payment data", () => {
    expect(verifyPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing signature", () => {
    const { razorpay_signature: _, ...rest } = valid;
    expect(verifyPaymentSchema.safeParse(rest).success).toBe(false);
  });
});

describe("parseBody", () => {
  it("returns success with parsed data", () => {
    const result = parseBody(loginSchema, { email: "a@b.com", password: "pass" });
    expect(result.success).toBe(true);
  });

  it("returns error message on failure", () => {
    const result = parseBody(loginSchema, { email: "bad" });
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toContain("email");
  });
});
