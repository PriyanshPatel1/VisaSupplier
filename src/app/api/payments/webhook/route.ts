/**
 * POST /api/payments/webhook
 *
 * Receives Stripe webhook events and keeps payment/application status in sync.
 * Signature is verified with stripe.webhooks.constructEvent() before any processing.
 *
 * Configure in Stripe Dashboard:
 *   Webhook URL : https://yourdomain.com/api/payments/webhook
 *   Events      : payment_intent.succeeded, payment_intent.payment_failed,
 *                 payment_intent.canceled
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PaymentMethod } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { dispatchNotification } from "@/lib/queue";

// Same fix as /verify: invoiceNumber @unique + MongoDB null-as-duplicate = P2002
function generateInvoiceNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${ym}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

const webhookLogger = logger.child({ route: "POST /api/payments/webhook" });

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });
}

function mapPaymentMethod(value: unknown): PaymentMethod {
  const method = String(value ?? "").trim().toLowerCase();
  switch (method) {
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

// Stripe webhooks require the raw body for signature verification.
// Next.js App Router routes expose req.text() for this.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    webhookLogger.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    webhookLogger.warn({ err: e }, "Webhook signature verification failed");
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  webhookLogger.info({ type: event.type }, "Stripe webhook received");

  try {
    switch (event.type) {
      // ── Payment succeeded ────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const gatewayRef = intent.id;
        const amountPaid = intent.amount_received / 100; // cents → dollars

        const existing = await prisma.payment.findFirst({ where: { gatewayRef } });

        if (existing) {
          // Update record created by /api/payments/verify
          await prisma.payment.update({
            where: { id: existing.id },
            data: { status: "completed", paidAt: new Date() },
          });

          if (existing.applicationId) {
            const app = await prisma.application.findUnique({
              where: { id: existing.applicationId },
              select: { userId: true, visaName: true },
            });
            if (app) {
              await dispatchNotification({
                userId: app.userId,
                title: "Payment Confirmed",
                message: `Payment of $${amountPaid.toFixed(2)} received for your ${app.visaName} application.`,
                notifType: "success",
                actionUrl: `/user/applications/${existing.applicationId}`,
              });
            }
          }
        } else {
          // Webhook arrived before /verify — create the record
          const methodType = typeof intent.payment_method === "object" && intent.payment_method !== null
            ? (intent.payment_method as Stripe.PaymentMethod).type
            : undefined;

          await prisma.payment.create({
            data: {
              amount: amountPaid,
              currency: intent.currency.toUpperCase(),
              status: "completed",
              method: mapPaymentMethod(methodType),
              gatewayRef,
              invoiceNumber: generateInvoiceNumber(),
              gatewayMeta: {
                payment_intent_id: intent.id,
                stripe_status: intent.status,
                stripe_amount: intent.amount,
                stripe_currency: intent.currency,
              },
              paidAt: new Date(),
            },
          });
        }

        webhookLogger.info({ gatewayRef, amountPaid }, "payment_intent.succeeded handled");
        break;
      }

      // ── Payment failed ───────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const gatewayRef = intent.id;

        const existing = await prisma.payment.findFirst({ where: { gatewayRef } });
        if (existing) {
          await prisma.payment.update({
            where: { id: existing.id },
            data: { status: "failed" },
          });
        }

        webhookLogger.warn({ gatewayRef }, "payment_intent.payment_failed handled");
        break;
      }

      // ── Payment canceled ─────────────────────────────────────────────────
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const gatewayRef = intent.id;

        const existing = await prisma.payment.findFirst({ where: { gatewayRef } });
        if (existing) {
          await prisma.payment.update({
            where: { id: existing.id },
            data: { status: "failed" },
          });
        }

        webhookLogger.info({ gatewayRef }, "payment_intent.canceled handled");
        break;
      }

      default:
        webhookLogger.info({ type: event.type }, "Unhandled Stripe event — ignored");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    webhookLogger.error({ err }, "Webhook processing error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
