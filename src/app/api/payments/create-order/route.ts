/**
 * POST /api/payments/create-order
 *
 * Stripe flow:
 *   1. Client sends { amount, visaId, supplierId }
 *   2. Server creates a Stripe PaymentIntent and returns { clientSecret, paymentIntentId }
 *   3. Client uses Stripe Elements to confirm the payment with the clientSecret
 *   4. On success client calls /api/payments/verify with payment_intent_id
 */

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { ok, err } from "@/lib/api-response";
import { getUserSession } from "@/lib/get-session";
import { createOrderSchema, parseRequestBody } from "@/lib/validators";

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return err("Unauthorized", 401);

  const parsed = await parseRequestBody(req, createOrderSchema);
  if (!parsed.success) return err(parsed.error);
  const { amount, visaId, supplierId } = parsed.data;

  try {
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      // Stripe expects amount in the smallest currency unit (cents for USD)
      amount: Math.round(amount * 100),
      currency: process.env.STRIPE_CURRENCY ?? "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        visaId: visaId ?? "",
        supplierId: supplierId ?? "",
        userId: session.sub,
      },
    });

    return ok({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (e) {
    console.error("[create-order] Stripe error:", e);
    return err("Failed to create payment order", 502);
  }
}
