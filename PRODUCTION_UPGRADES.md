# Production Upgrades — VisaHub

All 14 production-level improvements applied.

---

## 1. ✅ T3 Env Validation (`src/env.ts`)
Zod schema validates ALL env vars at server startup. Missing or malformed
variables throw immediately — no silent failures in production.

**Install:** `npm install zod`

---

## 2. ✅ Zod Input Validation (`src/lib/validators.ts`)
Centralised schemas for every API input: login, register, applications,
payments, profile updates, documents. Use `parseBody()` helper in routes.

**Before:** `const { email, password } = await req.json()` — unchecked
**After:** `const result = parseBody(loginSchema, body)` — typed + validated

---

## 3. ✅ Pino Structured Logger (`src/lib/logger.ts`)
Replaces `console.log/error` with structured JSON logs. PII redaction built in.

**Install:** `npm install pino pino-pretty`

```ts
import { logger } from "@/lib/logger";
logger.info({ userId }, "User logged in");
logger.error({ err, route }, "Failed");
```

---

## 4. ✅ Sentry Error Monitoring
- `sentry.server.config.ts` — Node.js runtime
- `sentry.client.config.ts` — Browser (with Session Replay)
- `sentry.edge.config.ts` — Edge runtime / middleware
- `src/instrumentation.ts` — Next.js 14 auto-init hook

**Install:** `npm install @sentry/nextjs`

**Env:** `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`

---

## 5. ✅ Upstash Redis Rate Limiting (`src/lib/rate-limit.ts`)
Dual-mode rate limiter:
- **UPSTASH_REDIS_REST_URL set** → Upstash Redis (multi-instance / edge safe)
- **Fallback** → In-process sliding window

Added `uploadLimiter` and `apiLimiter` on top of existing login/register limiters.

**Env:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

---

## 6. ✅ BullMQ Job Queue (`src/lib/queue.ts`)
Async job processing for emails, notifications, and audit logs.

- **Redis available** → BullMQ queues with 3 retries + exponential backoff
- **Fallback** → Inline execution (zero-dep dev mode)

Worker process: `npm run workers` (deploy as separate Railway/Fly service)

**Install:** `npm install bullmq`
**Env:** `REDIS_URL`

---

## 7. ✅ CSRF Protection (`src/lib/csrf.ts`)
Double-Submit Cookie Pattern for all state-mutating API routes.

- Sets `csrf-token` cookie (readable by JS)
- Validates `x-csrf-token` header on POST/PUT/PATCH/DELETE
- Exempt: `/api/payments/webhook`, `/api/auth/*`

Client helper: `import { csrfHeaders } from "@/lib/csrf"`

---

## 8. ✅ Razorpay Webhook (`src/app/api/payments/webhook/route.ts`)
- HMAC-SHA256 signature verification via `x-razorpay-signature` header
- Handles: `payment.captured`, `payment.failed`, `order.paid`
- Updates payment records and dispatches user notifications
- Timing-safe comparison prevents timing attacks

**Env:** `RAZORPAY_WEBHOOK_SECRET`
**Configure in Razorpay Dashboard:** `POST /api/payments/webhook`

---

## 9. ✅ API Versioning (`src/app/api/v1/`)
- `/api/v1/` → version manifest JSON
- `/api/v1/[...path]` → transparent proxy to `/api/*`
- Adds `x-api-version: v1` response header
- Future: add `/api/v2/` with new handlers, deprecate v1 with `Sunset` header

---

## 10. ✅ Swagger / OpenAPI Docs
- `src/lib/swagger.ts` — OpenAPI 3.1 spec
- `GET /api/docs` → JSON spec
- `GET /api/docs?ui=1` → Swagger UI (browser)

All endpoints documented with schemas, auth requirements, and response codes.

---

## 11. ✅ VirusTotal File Scanning (`src/lib/virustotal.ts`)
Scans every uploaded file before storing in Cloudinary.

- VT API upload + polling (up to 30s)
- Blocks file and returns 422 if threat detected
- Graceful degradation: skips scan if `VIRUSTOTAL_API_KEY` not set (warns in prod)
- Rate-limited uploads per user via `uploadLimiter`

**Env:** `VIRUSTOTAL_API_KEY`
**Free tier:** 4 lookups/min, 500/day

---

## 12. ✅ DB Connection Pooling (`src/lib/prisma.ts`)
- **ACCELERATE_URL set** → Prisma Accelerate (managed pool + edge caching)
- **Fallback** → Standard Prisma singleton

For PgBouncer: append `?pgbouncer=true&connection_limit=1` to `DATABASE_URL`

**Install:** `npm install @prisma/extension-accelerate`
**Env:** `ACCELERATE_URL`

---

## 13. ✅ Tests

### Unit Tests (Jest)
- `src/__tests__/lib/validators.test.ts` — Zod schema coverage
- `src/__tests__/lib/rate-limit.test.ts` — Rate limiter logic
- `src/__tests__/lib/jwt.test.ts` — Token sign/verify
- `src/__tests__/lib/auth-security.test.ts` — Password reset tokens

**Install:** `npm install -D jest jest-environment-node ts-jest @types/jest`
**Run:** `npm test` | `npm run test:coverage`

### E2E Tests (Playwright)
- `e2e/auth.spec.ts` — Login, register, redirects, health check, API docs

**Install:** `npm install -D @playwright/test && npx playwright install`
**Run:** `npm run test:e2e`

---

## 14. ✅ i18n (`src/i18n.ts` + `messages/`)
- `next-intl` integration with cookie-based locale detection
- English (`messages/en.json`) and Hindi (`messages/hi.json`) included
- Covers: auth, nav, applications, payments, errors

**Install:** `npm install next-intl`
**Supported locales:** `en`, `hi` (add `ar`, `zh` JSON files to expand)

---

## Quick Start

```bash
# Install all new dependencies
npm install

# Copy env template
cp .env.example .env.local

# Fill in env vars, then:
npm run db:generate
npm run db:push
npm run dev

# Tests
npm test
npm run test:e2e

# Workers (separate terminal/process)
npm run workers
```

## New npm scripts
| Script | What it does |
|---|---|
| `npm test` | Jest unit tests |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run workers` | Start BullMQ worker process |
