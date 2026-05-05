/**
 * Prisma client singleton with optional Prisma Accelerate support.
 *
 * - `ACCELERATE_URL` set -> Prisma Accelerate datasource.
 * - fallback            -> Standard Prisma datasource from schema/env.
 */

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function createPrismaClient(): PrismaClient {
  if (process.env.ACCELERATE_URL) {
    return new PrismaClient({
      datasourceUrl: process.env.ACCELERATE_URL,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
