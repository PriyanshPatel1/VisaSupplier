"use client";

/**
 * WizardPayment — Stripe Payment Elements (production-grade)
 *
 * Architecture:
 *   WizardPayment          — fetches PaymentIntent, renders <Elements> wrapper
 *   └─ CheckoutForm        — useStripe / useElements hooks + <PaymentElement />
 *
 * Flow:
 *   1. On mount  → POST /api/payments/create-order → { clientSecret, paymentIntentId }
 *   2. <Elements> mounts → Stripe renders <PaymentElement /> safely into the DOM
 *   3. User clicks Pay → stripe.confirmPayment() confirms the PaymentIntent
 *   4. On success → POST /api/payments/verify with payment_intent_id
 *   5. onPaid(paymentId) → GenericWizard creates the application record
 *
 * Required env vars:
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   (browser-safe)
 *   STRIPE_SECRET_KEY                    (server-only)
 *   STRIPE_WEBHOOK_SECRET                (server-only)
 */

import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { VisaType } from "@/types";
import { csrfHeaders } from "@/lib/csrf";

// ── Stripe singleton (initialised once, never recreated) ──────────────────────
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

// ─────────────────────────────────────────────────────────────────────────────
// Inner form — only rendered once Elements (and clientSecret) are ready
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutFormProps {
  totalPaid: number;
  paymentIntentId: string;
  onBack: () => void;
  onPaid: (paymentId?: string) => Promise<void>;
}

function CheckoutForm({ totalPaid, paymentIntentId, onBack, onPaid }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePay = useCallback(async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    try {
      // Submit the Elements form first (triggers built-in validation)
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message ?? "Validation failed");

      // Confirm the PaymentIntent without redirecting
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/user/applications`,
        },
      });

      if (confirmError) throw new Error(confirmError.message ?? "Payment failed");
      if (paymentIntent?.status !== "succeeded") {
        throw new Error(`Unexpected payment status: ${paymentIntent?.status}`);
      }

      // Use the confirmed paymentIntent.id (source of truth from Stripe)
      // rather than the prop, in case of any mismatch
      const confirmedIntentId = paymentIntent?.id ?? paymentIntentId;

      // Server-side verification & DB record
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        // amount omitted — server uses Stripe's verified amount_received
        body: JSON.stringify({ payment_intent_id: confirmedIntentId }),
      });

      if (!verifyRes.ok) {
        const j = await verifyRes.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Payment verification failed");
      }

      const { data } = (await verifyRes.json()) as { data: { paymentId: string } };
      setSuccess(true);
      await onPaid(data?.paymentId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, paymentIntentId, totalPaid, onPaid]);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-400">Your application has been submitted.</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting to your applications…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stripe Payment Element — mounts safely here because Elements is ready */}
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="px-6 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium transition-all disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={processing || !stripe || !elements}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40"
        >
          {processing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing…
            </>
          ) : (
            `🔒 Pay $${totalPaid}`
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Outer wrapper — fetches PaymentIntent, then renders <Elements>
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  visa: VisaType;
  supplier: { name: string; id: string } | undefined;
  totalPaid: number;
  onBack: () => void;
  onPaid: (paymentId?: string) => Promise<void>;
}

export function WizardPayment({ visa, supplier, totalPaid, onBack, onPaid }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Fetch PaymentIntent on mount.
  // On unmount (user hits Back), cancel the stale intent so Stripe does not
  // hold the funds open — best-effort fire-and-forget.
  useEffect(() => {
    let cancelled = false;
    let createdIntentId: string | null = null;

    const init = async () => {
      try {
        const res = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...csrfHeaders() },
          credentials: "include",
          body: JSON.stringify({
            amount: totalPaid,
            visaId: visa.id,
            supplierId: supplier?.id,
          }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error ?? "Failed to create payment order");
        }

        const { data } = (await res.json()) as {
          data: { clientSecret: string; paymentIntentId: string };
        };

        if (!data?.clientSecret) throw new Error("No client secret returned from server");
        if (cancelled) return;

        createdIntentId = data.paymentIntentId;
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (e) {
        if (!cancelled) setInitError(e instanceof Error ? e.message : "Payment setup failed");
      }
    };

    init();
    return () => {
      cancelled = true;
      if (createdIntentId) {
        fetch("/api/payments/cancel-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...csrfHeaders() },
          credentials: "include",
          body: JSON.stringify({ payment_intent_id: createdIntentId }),
        }).catch(() => {/* best-effort */});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Init error ──────────────────────────────────────────────────────────────
  if (initError) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm font-semibold text-red-300">Payment setup failed</p>
          <p className="text-xs text-red-400/80 mt-1">{initError}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium transition-all"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Order summary */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Order Summary</h3>
        <div className="flex justify-between text-sm py-2 border-b border-white/10">
          <span className="text-gray-400">{visa.name}</span>
          <span className="text-white font-semibold">${totalPaid}</span>
        </div>
        {supplier && (
          <div className="flex justify-between text-sm py-2 border-b border-white/10">
            <span className="text-gray-500">Provider</span>
            <span className="text-gray-300">{supplier.name}</span>
          </div>
        )}
        <div className="flex justify-between pt-3">
          <span className="font-bold text-white">Total</span>
          <span className="text-xl font-black text-indigo-400">${totalPaid}</span>
        </div>
      </div>

      {/* Payment form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-1">Secure Payment</h3>
        <p className="text-xs text-gray-400 mb-5">
          Supports Card, Apple Pay, Google Pay &amp; more — secured by Stripe.
        </p>

        {/* Loading skeleton while PaymentIntent is being created */}
        {!clientSecret ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 rounded-xl bg-white/5 border border-white/10" />
            <div className="h-12 rounded-xl bg-white/5 border border-white/10" />
            <div className="h-12 rounded-xl bg-white/5 border border-white/10 w-1/2" />
            <div className="flex justify-between pt-2">
              <div className="h-10 w-24 rounded-xl bg-white/5" />
              <div className="h-10 w-32 rounded-xl bg-indigo-500/20" />
            </div>
          </div>
        ) : (
          // Elements only renders (and PaymentElement mounts) once clientSecret is set —
          // this eliminates the "no DOM element found" error entirely.
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#6366f1",
                  colorBackground: "#0f172a",
                  colorText: "#e2e8f0",
                  colorDanger: "#f87171",
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                  borderRadius: "10px",
                  spacingUnit: "4px",
                },
              },
            }}
          >
            <CheckoutForm
              totalPaid={totalPaid}
              paymentIntentId={paymentIntentId!}
              onBack={onBack}
              onPaid={onPaid}
            />
          </Elements>
        )}
      </div>

      <p className="text-center text-xs text-gray-600">
        🔒 Payments secured by Stripe — PCI DSS compliant
      </p>
    </div>
  );
}
