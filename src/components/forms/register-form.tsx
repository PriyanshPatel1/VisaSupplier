"use client";

import { useState, useRef } from "react";

/* ─── Country list (abridged – extend as needed) ────────────── */
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Ethiopia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
  "Zimbabwe",
].sort();

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const STEPS = ["Account", "Personal", "Security"];

/* ─── Cloudinary upload ──────────────────────────────────────── */
async function uploadAvatar(file: File): Promise<{
  url: string | null;
  error?: string;
  status?: number;
  skippable?: boolean;
}> {
  const body = new FormData();
  body.append("file", file);

  try {
    const res = await fetch("/api/auth/upload-avatar", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        url: null,
        error: data?.error ?? "Avatar upload failed.",
        status: res.status,
      };
    }

    if (data?.data?.unavailable) {
      return {
        url: null,
        error:
          (data?.data?.message as string | undefined) ??
          "Avatar uploads are temporarily unavailable.",
        status: res.status,
        skippable: true,
      };
    }

    return {
      url: (data?.data?.url as string | undefined) ?? null,
      status: res.status,
    };
  } catch (error) {
    console.error("AVATAR_UPLOAD_ERROR", error);
    return {
      url: null,
      error:
        error instanceof Error
          ? error.message
          : "Avatar upload failed. Please try again.",
    };
  }
}

/* ─── Component ─────────────────────────────────────────────── */
export default function RegisterForm() {
  const avatarRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [registrationResult, setRegistrationResult] = useState<{
    email: string;
    emailSent: boolean;
    message: string;
  } | null>(null);
  const [resendState, setResendState] = useState<{
    loading: boolean;
    message: string;
    error: string;
  }>({ loading: false, message: "", error: "" });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    nationality: "",
    dob: "",
    gender: "" as "" | "male" | "female" | "non_binary" | "prefer_not_to_say",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarNotice, setAvatarNotice] = useState("");

  const strength = getPasswordStrength(form.password);
  const strengthText = ["Very weak", "Weak", "Fair", "Strong", "Very strong"][
    strength
  ];

  /* ── Handlers ── */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    const value = type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Max file size is 5 MB" }));
      return;
    }
    setAvatarFile(file);
    setErrors((prev) => ({ ...prev, avatar: "" }));
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      if (!form.firstName) newErrors.firstName = "First name is required";
      if (!form.lastName) newErrors.lastName = "Last name is required";
      if (!form.email) newErrors.email = "Email is required";
    }
    if (s === 1) {
      if (!form.phone) newErrors.phone = "Phone is required";
      if (!form.country) newErrors.country = "Country is required";
      if (!form.nationality) newErrors.nationality = "Nationality is required";
      if (!form.dob) newErrors.dob = "DOB is required";
      if (!form.gender) newErrors.gender = "Gender is required";
    }
    if (s === 2) {
      if (!form.password) newErrors.password = "Password is required";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      if (!form.terms) newErrors.terms = "You must agree to terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
  }

  async function resendVerificationEmail() {
    if (!registrationResult?.email) return;

    setResendState({ loading: true, message: "", error: "" });

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registrationResult.email }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendState({
          loading: false,
          message: "",
          error:
            json.error ??
            "We could not resend the verification email right now.",
        });
        return;
      }

      setRegistrationResult((current) =>
        current
          ? {
              ...current,
              emailSent: true,
              message:
                "We sent a fresh verification link. Please check your inbox before signing in.",
            }
          : current,
      );
      setResendState({
        loading: false,
        message: json.data?.message ?? "Verification email sent.",
        error: "",
      });
    } catch {
      setResendState({
        loading: false,
        message: "",
        error: "Network error. Please try again.",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setErrors({});
    setResendState({ loading: false, message: "", error: "" });
    setAvatarNotice("");

    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const upload = await uploadAvatar(avatarFile);
        if (upload.url) {
          avatarUrl = upload.url;
        } else if (
          upload.skippable ||
          (upload.status && upload.status >= 500)
        ) {
          setAvatarNotice(
            upload.error ??
              "Profile photo upload is unavailable right now. We will create your account without it.",
          );
        } else {
          setErrors({
            avatar: upload.error ?? "Avatar upload failed. Please try again.",
          });
          setStep(0);
          return;
        }
      }

      const payload: Record<string, unknown> = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        nationality: form.nationality,
        dob: form.dob,
        gender: form.gender,
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ✅ 409 = email already exists → surface on email field, jump to step 0
        if (res.status === 409) {
          setErrors({
            email: json.error || "An account with this email already exists",
          });
          setStep(0);
          return;
        }

        // ✅ 400 = Zod field errors → spread fieldErrors so each field shows its own message
        setErrors({
          submit: json.error || "Registration failed",
          ...(json.fieldErrors || {}),
        });
        return;
      }

      setRegistrationResult({
        email: form.email,
        emailSent: json.data?.emailSent !== false,
        message:
          json.data?.message ??
          "Account created. Please verify your email before logging in.",
      });
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ── */
  // ✅ NEW: shown after 201, replaces form entirely
  if (registrationResult) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center text-center gap-5 py-4">
          {/* Envelope icon */}
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center shadow-inner">
            <svg
              className="w-10 h-10 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {registrationResult.emailSent
                ? "Check your inbox"
                : "Account created"}
            </h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
              {registrationResult.message}{" "}
              <span className="font-semibold text-indigo-600">
                {registrationResult.email}
              </span>
              .
            </p>
          </div>

          <div
            className={`w-full rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 ${
              registrationResult.emailSent
                ? "bg-amber-50 border border-amber-200 text-amber-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {registrationResult.emailSent
                ? "Please verify your email address before signing in. If you haven’t received the verification email, be sure to check your spam or junk folder"
                : "You still need to verify your email before signing in. Use the resend button below once mail delivery is available."}
            </span>
          </div>

          {!registrationResult.emailSent && (
            <button
              type="button"
              onClick={resendVerificationEmail}
              disabled={resendState.loading}
              className="w-full py-3 border-2 border-indigo-200 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendState.loading
                ? "Resending verification email..."
                : "Resend verification email"}
            </button>
          )}

          {resendState.message && (
            <p className="w-full text-left text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              {resendState.message}
            </p>
          )}

          {resendState.error && (
            <p className="w-full text-left text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {resendState.error}
            </p>
          )}

          {avatarNotice && (
            <p className="w-full text-left text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {avatarNotice}
            </p>
          )}

          <a
            href="/login"
            className="w-full block text-center py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create your account
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* ── Step 0: Account basics ── */}
        {step === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col items-center gap-3 pb-2">
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 hover:border-indigo-400 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
                aria-label="Upload profile picture"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex flex-col items-center justify-center gap-1">
                    <svg
                      className="w-8 h-8 text-indigo-300 group-hover:text-indigo-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Profile photo
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG or WebP · max 5 MB
                </p>
              </div>
              {avatarNotice && (
                <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {avatarNotice}
                </p>
              )}
              {errors.avatar && (
                <p className="text-red-500 text-xs">{errors.avatar}</p>
              )}
            </div>

            <Divider label="Basic info" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" error={errors.firstName}>
                <Input
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
              </Field>
              <Field label="Last Name" error={errors.lastName}>
                <Input
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
              </Field>
            </div>

            <Field label="Email Address" error={errors.email}>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                icon={<EmailIcon />}
              />
            </Field>
          </div>
        )}

        {/* ── Step 1: Personal info ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <Field label="Phone Number" error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<PhoneIcon />}
              />
            </Field>

            <Field label="Country of Residence" error={errors.country}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <GlobeIcon />
                </span>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg pl-10 pr-4 py-3 text-sm appearance-none transition-colors ${errors.country ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"} outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white cursor-pointer`}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronIcon />
                </span>
              </div>
            </Field>

            <Field label="Nationality" error={errors.nationality}>
              <Input
                name="nationality"
                placeholder="e.g. American, British, Indian"
                value={form.nationality}
                onChange={handleChange}
                error={errors.nationality}
                icon={<FlagIcon />}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Birth" error={errors.dob}>
                <Input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  error={errors.dob}
                  max={
                    new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </Field>
              <Field label="Gender" error={errors.gender}>
                <div className="relative">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg px-4 py-3 text-sm appearance-none transition-colors ${errors.gender ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"} outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white cursor-pointer`}
                  >
                    <option value="">Select…</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronIcon />
                  </span>
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 2: Security ── */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <Field label="Password" error={errors.password}>
              <Input
                name="password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon={<LockIcon />}
              />
              {form.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${i <= strength ? getColor(strength) : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-400">Password strength</p>
                    <p
                      className={`text-xs font-semibold ${getTextColor(strength)}`}
                    >
                      {strengthText}
                    </p>
                  </div>
                </div>
              )}
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<LockIcon />}
              />
            </Field>

            <div
              className={`rounded-xl p-4 border-2 transition-colors ${errors.terms ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}
            >
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  name="terms"
                  type="checkbox"
                  checked={form.terms}
                  className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-2 ml-7">{errors.terms}</p>
              )}
            </div>

            {errors.submit && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div
          className={`flex gap-3 pt-2 ${step > 0 ? "flex-row" : "flex-col"}`}
        >
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
            >
              ← Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account…
                </span>
              ) : (
                "Create Account ✓"
              )}
            </button>
          )}
        </div>

        {step === 0 && (
          <>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>
            <a
              href="/login"
              className="w-full block text-center py-2.5 border-2 border-indigo-200 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
            >
              Sign in instead
            </a>
          </>
        )}
      </form>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < current ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : i === current ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-200" : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}
            >
              {i < current ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${i <= current ? "text-indigo-600" : "text-gray-400"}`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${i < current ? "bg-indigo-500" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full border-2 rounded-xl ${icon ? "pl-10" : "px-4"} pr-4 py-3 text-sm transition-all duration-150 ${error ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"} outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400`}
      />
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────── */
const EmailIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const PhoneIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const GlobeIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const FlagIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 21V4m0 0l8-1 5 1 5-1v11l-5 1-5-1-8 1V4z"
    />
  </svg>
);
const LockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
const ChevronIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────── */
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
function getColor(score: number) {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-yellow-400";
  if (score === 3) return "bg-blue-500";
  return "bg-emerald-500";
}
function getTextColor(score: number) {
  if (score <= 1) return "text-red-600";
  if (score === 2) return "text-yellow-600";
  if (score === 3) return "text-blue-600";
  return "text-emerald-600";
}
