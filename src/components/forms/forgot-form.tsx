"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { authApi } from "@/lib/api-client";
import {
  forgotPasswordSchema,
  getZodFieldErrors,
  resetPasswordSchema,
} from "@/lib/validators";

const resetPasswordFormSchema = z
  .object({
    token: resetPasswordSchema.shape.token,
    password: resetPasswordSchema.shape.password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

type Step = 1 | 2 | 3 | 4;

const EyeIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthColor(score: number) {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-yellow-500";
  if (score === 3) return "bg-blue-500";
  return "bg-green-500";
}

function getStrengthTextColor(score: number) {
  if (score <= 1) return "text-red-600";
  if (score === 2) return "text-yellow-600";
  if (score === 3) return "text-blue-600";
  return "text-green-600";
}

export default function ForgotForm() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });

  const handleStep1 = async () => {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors(getZodFieldErrors(result.error));
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(result.data.email);
      setErrors({});
      setStep(2);
    } catch {
      // Keep flow consistent even on failure to avoid email enumeration.
      setErrors({});
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = () => {
    const result = resetPasswordSchema.shape.token.safeParse(token);
    if (!result.success) {
      setErrors({
        token:
          result.error.issues[0]?.message ?? "Please enter your reset token",
      });
      return;
    }

    setErrors({});
    setStep(3);
  };

  const handleStep3 = async () => {
    const result = resetPasswordFormSchema.safeParse({
      token,
      password,
      confirmPassword,
    });
    if (!result.success) {
      setErrors(getZodFieldErrors(result.error));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(result.data.token, result.data.password);
      setErrors({});
      setStep(4);
    } catch (error: unknown) {
      setErrors({
        password:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Token may be invalid or expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = getPasswordStrength(password);
  const strengthText = ["Very weak", "Weak", "Fair", "Strong", "Very strong"][
    strengthScore
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 flex gap-2">
          {[1, 2, 3, 4].map((progressStep) => (
            <div
              key={progressStep}
              className={`h-2 flex-1 rounded-full transition-colors ${
                progressStep <= step ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Forgot password?
          </h2>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            Enter your email and we will send a 6-digit verification code to
            your email.
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors({});
              }}
              className={`w-full rounded-lg border-2 px-4 py-3 text-sm outline-none transition-colors ${
                errors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            ) : null}
          </div>
          <button
            onClick={handleStep1}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send reset token"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Enter verification code
          </h2>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            Enter the 6-digit code sent to your email{" "}
            <span className="font-semibold">{email}</span>. The code expires in
            10 minutes.
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                if (errors.token) setErrors({});
              }}
              className={`w-full rounded-lg border-2 px-4 py-3 font-mono text-sm outline-none transition-colors ${
                errors.token
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />
            {errors.token ? (
              <p className="mt-1 text-xs text-red-500">{errors.token}</p>
            ) : null}
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700"></div>
          <button
            onClick={handleStep2}
            disabled={!token.trim()}
            className="mt-5 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-70"
          >
            Continue
          </button>
          <button
            onClick={() => {
              setStep(1);
              setToken("");
              setErrors({});
            }}
            className="mt-3 w-full rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Use different email
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Create new password
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Use at least 8 characters, including 1 uppercase letter and 1
            number.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.password ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) setErrors({});
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-3 pr-12 text-sm outline-none transition-colors ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((previous) => ({
                      ...previous,
                      password: !previous.password,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.password ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              ) : null}
              {password ? (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="h-1.5 flex-1 rounded-full bg-gray-200"
                      >
                        {index <= strengthScore ? (
                          <div
                            className={`h-full rounded-full ${getStrengthColor(strengthScore)}`}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${getStrengthTextColor(strengthScore)}`}
                  >
                    {strengthText}
                  </p>
                </div>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (errors.confirmPassword) setErrors({});
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-3 pr-12 text-sm outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((previous) => ({
                      ...previous,
                      confirm: !previous.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={handleStep3}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
          <button
            onClick={() => setStep(2)}
            className="mt-3 w-full rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Password reset!
          </h2>
          <p className="mb-8 text-sm text-gray-600">
            Your password has been reset. Sign in with your new password.
          </p>
          <Link
            href="/login"
            className="block w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-center font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
          >
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
}
