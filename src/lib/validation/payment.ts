import { z } from "zod";

export const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  visaId: z.string().trim().optional(),
  supplierId: z.string().trim().optional(),
});

/** Stripe: client confirms PaymentIntent, then sends payment_intent_id to /verify.
 *  Amount is intentionally NOT accepted from the client — the server reads
 *  intent.amount_received from Stripe to prevent amount-tampering attacks. */
export const verifyPaymentSchema = z.object({
  payment_intent_id: z.string().trim().min(1, "payment_intent_id is required"),
});
