import { NextRequest } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { ok, err } from "@/lib/api-response";
import { getUserSession } from "@/lib/get-session";
import { parseRequestBody } from "@/lib/validators";
import { logger } from "@/lib/logger";

const cancelLogger = logger.child({ route: "POST /api/payments/cancel-intent" });

const cancelSchema = z.object({
  payment_intent_id: z.string().trim().min(1),
});

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY env var is not set");
  return new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return err("Unauthorized", 401);

  const parsed = await parseRequestBody(req, cancelSchema);
  if (!parsed.success) return err(parsed.error);

  try {
    const stripe = getStripe();
    // Canceling a succeeded/processing intent is a no-op in Stripe — safe to call
    await stripe.paymentIntents.cancel(parsed.data.payment_intent_id);
    cancelLogger.info({ payment_intent_id: parsed.data.payment_intent_id }, "Intent cancelled");
    return ok({ cancelled: true });
  } catch (e) {
    // Non-fatal: log and swallow. Stripe will expire uncaptured intents automatically.
    cancelLogger.warn({ err: e, payment_intent_id: parsed.data.payment_intent_id }, "Cancel intent failed (non-fatal)");
    return ok({ cancelled: false });
  }
}
