import { NextRequest } from "next/server";
import Stripe from "stripe";
import { PaymentMethod } from "@prisma/client";
import { randomBytes } from "crypto";
import { ok, err } from "@/lib/api-response";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { parseRequestBody, verifyPaymentSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

const verifyLogger = logger.child({ route: "POST /api/payments/verify" });

/**
 * Generate a unique invoice number.
 * Format: INV-YYYYMM-<8 random hex chars>  e.g. INV-202605-3F9A12BC
 *
 * ROOT CAUSE FIX: invoiceNumber has @unique in the Prisma schema.
 * MongoDB unique indexes treat multiple null values as DUPLICATES (unlike
 * PostgreSQL where each NULL is distinct). So the second upsert with
 * invoiceNumber: null crashed with P2002 Payment_invoiceNumber_key.
 * Every Payment record must carry a distinct non-null invoiceNumber.
 */
function generateInvoiceNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `INV-${ym}-${rand}`;
}

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY env var is not set");
  return new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
}

function mapPaymentMethod(type: string | undefined): PaymentMethod {
  switch ((type ?? "").toLowerCase()) {
    case "card":
      return PaymentMethod.card;
    case "us_bank_account":
    case "sepa_debit":
    case "bacs_debit":
    case "bank_transfer":
      return PaymentMethod.bank_transfer;
    case "alipay":
    case "wechat_pay":
      return PaymentMethod.wallet;
    default:
      return PaymentMethod.other;
  }
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return err("Unauthorized", 401);

  const parsed = await parseRequestBody(req, verifyPaymentSchema);
  if (!parsed.success) return err(parsed.error);
  const { payment_intent_id } = parsed.data;

  // ── 1. Retrieve & verify PaymentIntent from Stripe (server-side truth) ──────
  let intent: Stripe.PaymentIntent;
  try {
    const stripe = getStripe();
    intent = await stripe.paymentIntents.retrieve(payment_intent_id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    verifyLogger.error({ err: e, payment_intent_id }, "Stripe retrieve failed");
    return err(`Payment verification failed: ${msg}`, 502);
  }

  if (intent.status !== "succeeded") {
    verifyLogger.warn({ status: intent.status, payment_intent_id }, "PaymentIntent not succeeded");
    return err(`Payment not completed (status: ${intent.status})`, 400);
  }

  // ── 2. Use Stripe-verified amount — NEVER trust client-supplied amount ───────
  const amountVerified = intent.amount_received / 100;
  const currency = (intent.currency ?? "usd").toUpperCase();
  const methodLabel = mapPaymentMethod(intent.payment_method_types?.[0]);

  const gatewayMeta = {
    payment_intent_id,
    stripe_status: intent.status,
    stripe_amount_received: intent.amount_received,
    stripe_currency: intent.currency,
    method: intent.payment_method_types?.[0] ?? "card",
    user_id: session.sub,
  };

  // ── 3. Idempotency: check if already recorded before creating ────────────────
  // We use findFirst + create instead of upsert here because upsert's create
  // block runs even on update paths in some Prisma/MongoDB edge cases, and
  // we need full control to avoid the invoiceNumber unique constraint.
  let payment: { id: string };
  try {
    const existing = await prisma.payment.findUnique({
      where: { gatewayRef: payment_intent_id },
      select: { id: true },
    });

    if (existing) {
      // Already recorded (webhook beat us) — update status and return
      await prisma.payment.update({
        where: { id: existing.id },
        data: { status: "completed", amount: amountVerified, paidAt: new Date(), gatewayMeta },
      });
      payment = existing;
    } else {
      // First to record — create with a guaranteed-unique invoiceNumber
      payment = await prisma.payment.create({
        data: {
          amount: amountVerified,
          currency,
          status: "completed",
          method: methodLabel,
          gatewayRef: payment_intent_id,
          gatewayMeta,
          paidAt: new Date(),
          invoiceNumber: generateInvoiceNumber(),
        },
        select: { id: true },
      });
    }
  } catch (e) {
    verifyLogger.error(
      { err: e, payment_intent_id, userId: session.sub },
      "Failed to record payment"
    );
    return err("Failed to record payment — please contact support", 500);
  }

  verifyLogger.info(
    { paymentId: payment.id, payment_intent_id, amount: amountVerified, userId: session.sub },
    "Payment verified and recorded"
  );

  return ok({ verified: true, paymentId: payment.id });
}
