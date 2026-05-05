export * from "@/lib/validation/auth";
export * from "@/lib/validation/user";
export * from "@/lib/validation/application";
export * from "@/lib/validation/document";
export * from "@/lib/validation/payment";
export { parseBody, parseSearchParams } from "@/lib/validation/request";
import { z } from "zod";
// src/lib/validators.ts
export const sendVerificationSchema = z.object({
      email: z.string().email(),
});
