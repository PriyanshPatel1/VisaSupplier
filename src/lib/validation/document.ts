import { z } from "zod";

export const createDocumentSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(255, "name is too long"),
  type: z.string().trim().min(1, "type is required").max(100, "type is too long"),
  size: z.coerce.number().int("size must be an integer").nonnegative("size must be a non-negative integer"),
  fileUrl: z.string().trim().url("fileUrl must be a valid URL"),
  publicId: z.union([z.string().trim(), z.literal("")]).optional(),
  mimeType: z.union([z.string().trim(), z.literal("")]).optional(),
});

export const updateDocumentSchema = z
  .object({
    name: z.string().trim().min(1, "name cannot be empty").max(255, "name is too long").optional(),
    fileUrl: z.string().trim().url("fileUrl must be a valid URL").optional(),
  })
  .refine((value) => value.name !== undefined || value.fileUrl !== undefined, {
    message: "No fields to update",
  });
