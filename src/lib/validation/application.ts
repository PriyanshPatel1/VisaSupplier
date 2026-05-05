import { z } from "zod";

const jsonRecordSchema = z.record(z.unknown());

export const applicationStatusSchema = z.enum([
  "draft",
  "submitted",
  "processing",
  "approved",
  "rejected",
  "cancelled",
]);

export const createApplicationSchema = z.object({
  visaId: z.string().trim().min(1, "visaId is required"),
  supplierId: z.string().trim().min(1, "supplierId is required"),
  totalPaid: z.coerce.number().nonnegative("totalPaid must be a non-negative number"),
  personal: jsonRecordSchema.optional().default({}),
  passport: jsonRecordSchema.optional().default({}),
  travel: jsonRecordSchema.optional().default({}),
  documents: jsonRecordSchema.optional().default({}),
  formData: jsonRecordSchema.optional().default({}),
});

export const updateApplicationSchema = z
  .object({
    personal: jsonRecordSchema.optional(),
    passport: jsonRecordSchema.optional(),
    travel: jsonRecordSchema.optional(),
  })
  .refine(
    (value) =>
      value.personal !== undefined || value.passport !== undefined || value.travel !== undefined,
    { message: "No fields to update" },
  );

export const applicationsListQuerySchema = z.object({
  status: z
    .enum(["all", "draft", "submitted", "processing", "approved", "rejected", "cancelled"])
    .optional()
    .default("all"),
  q: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).max(100000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(8),
  sortBy: z.enum(["submittedAt", "updatedAt"]).optional().default("updatedAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
