// Global test setup
import { jest } from "@jest/globals";

// Mock Prisma globally
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    adminConfig: { count: jest.fn().mockImplementation(async () => 1) },
  },
}));

// Env defaults for tests
Object.assign(process.env as Record<string, string | undefined>, {
  JWT_SECRET: "test-jwt-secret-at-least-32-chars-long",
  NODE_ENV: "test",
  RAZORPAY_KEY_ID: "rzp_test_key",
  RAZORPAY_KEY_SECRET: "rzp_test_secret",
  RAZORPAY_WEBHOOK_SECRET: "rzp_webhook_secret",
});
