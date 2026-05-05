import { z } from "zod";

const optionalTrimmed = z.string().trim().optional();
const emptyableTrimmed = z.union([z.string().trim(), z.literal("")]).optional();
const emptyableUrl = z.union([z.string().trim().url("Invalid URL"), z.literal("")]).optional();
const emptyableDate = z
  .union([z.string().trim(), z.literal("")])
  .optional()
  .refine(
    (value) => {
      if (value === undefined || value === "") return true;
      return !Number.isNaN(new Date(value).getTime());
    },
    { message: "Invalid date" },
  );

export const updateProfileSchema = z.object({
  name: optionalTrimmed.refine((value) => value === undefined || value.length >= 2, {
    message: "Name must be at least 2 characters",
  }),
  phone: emptyableTrimmed.refine(
    (value) => value === undefined || value === "" || /^\+?[1-9]\d{6,14}$/.test(value),
    { message: "Invalid phone number" },
  ),
  country: emptyableTrimmed.transform((value) => (value ? value.toUpperCase() : value)).refine(
    (value) => value === undefined || value === "" || value.length === 2,
    { message: "Use a 2-letter country code" },
  ),
  nationality: emptyableTrimmed,
  dob: emptyableDate,
  gender: z
    .enum(["male", "female", "other", "non_binary", "prefer_not_to_say"])
    .optional(),
  address: optionalTrimmed.refine((value) => value === undefined || value.length <= 500, {
    message: "Address must be 500 characters or fewer",
  }),
  avatar: emptyableUrl,
});
