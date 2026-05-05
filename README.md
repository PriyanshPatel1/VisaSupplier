<div align="center">

# VisaHub

### End-to-end visa application management platform

**Built for applicants, processing agents, and platform administrators — on one unified codebase.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=flat-square)](LICENSE)

<br/>

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [⚙️ Environment Variables](#%EF%B8%8F-environment-variables) · [🔐 Security](#-security) · [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [What is VisaHub?](#-what-is-visahub)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#%EF%B8%8F-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#%EF%B8%8F-environment-variables)
- [Database Setup](#%EF%B8%8F-database-setup)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 What is VisaHub?

VisaHub is a **production-ready, full-stack visa management SaaS** that connects three distinct user groups on a single platform:

<br/>

| Portal | User Type | Core Capabilities |
|---|---|---|
| 🧳 **Applicant** | Visa seekers | Browse visas, submit applications via dynamic wizards, upload documents, pay fees, track real-time status |
| 🏢 **Supplier** | Processing agents | Manage assigned application queues, review/verify documents, update statuses, receive notifications |
| ⚙️ **Admin** | Platform operators | Manage countries, visa catalog, dynamic forms, users, payments, support tickets, site content |

<br/>

> VisaHub ships with **14 pre-configured visa types** across **5 countries** (US, UK, Canada, UAE, Germany) — all editable from the admin panel without code changes or database migrations.

---

## ✨ Key Features

### For Applicants
- **Dynamic multi-step wizard** — each visa type has its own custom form, configured entirely from the admin panel
- **DS-160 validation** — US visa application fields validated to USCIS specification
- **Document upload with virus scanning** — every file scanned via VirusTotal before cloud storage
- **Real-time status tracking** — `draft → submitted → processing → approved / rejected`
- **Razorpay payments** — order creation, HMAC-verified webhooks, refund tracking
- **Email verification** — required before first login
- **Billing history** — full payment ledger per user

### For Suppliers
- Assigned application queue with inline status controls
- Document review and verification workflow
- In-app notification center
- Profile management

### For Admins
- **Country & visa catalog** — add, edit, and deactivate countries and visa types from the UI
- **Form builder** — drag-and-drop field ordering, section grouping, per-field validation rules
- **User & supplier management** — create, deactivate, reassign
- **Payment oversight** — full ledger with refund initiation
- **Support ticket system** — priority queue with threaded replies
- **Site content editor** — update landing page content without a deploy
- **Audit log** — tamper-evident trail of all admin actions

### Platform-wide
- **3-role JWT auth** — isolated cookies per role (`visahub_user_token`, `visahub_admin_token`, `visahub_supplier_token`)
- **CSRF protection** — Double-Submit Cookie Pattern on all state-mutating endpoints
- **Rate limiting** — Upstash Redis (distributed) with in-memory sliding-window fallback
- **Async job queue** — BullMQ + Redis for emails and notifications; inline fallback for zero-dependency dev
- **Sentry monitoring** — server, client, and edge runtimes
- **OpenAPI 3.1 docs** — auto-generated, browsable at `/api/docs?ui=1`
- **i18n** — English, Hindi, Arabic, German via `next-intl`
- **Zod env validation** — startup fails immediately on missing or malformed config
- **Structured logging** — Pino JSON logs with PII redaction

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, routing, API routes |
| **UI** | React 19, Tailwind CSS 4 | Components and styling |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Database** | MongoDB Atlas + Prisma 6 | Data persistence and ORM |
| **Auth** | JWT (`jose`), bcrypt | Session management, password hashing |
| **Payments** | Razorpay | Payment orders and webhook events |
| **File Storage** | Cloudinary | Document and avatar uploads |
| **Email** | Nodemailer / Resend | Transactional emails |
| **Job Queue** | BullMQ + Redis (Upstash) | Async email and notification processing |
| **Rate Limiting** | Upstash Redis | Distributed API rate limiting |
| **Monitoring** | Sentry | Error tracking and session replay |
| **Animations** | Framer Motion | UI transitions |
| **State** | Zustand | Client-side global state |
| **Validation** | Zod | Input validation and env parsing |
| **Testing** | Jest + Playwright | Unit and end-to-end tests |
| **Logging** | Pino | Structured JSON logging |
| **i18n** | next-intl | Multi-language support |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Next.js 16                             │
│                                                                 │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Applicant     │  │  Supplier       │  │  Admin          │  │
│  │  /user/*       │  │  /supplier/*    │  │  /admin/*       │  │
│  │  /apply/*      │  │                 │  │                 │  │
│  └────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           REST API   /api/*   ·   /api/v1/* (proxy)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Middleware:  JWT verify → CSRF check → Rate limit → Guard      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼─────────────────┐
            ▼               ▼                 ▼
       MongoDB           Cloudinary         BullMQ
       (Prisma)          (uploads)          (Redis)
                            │
                       VirusTotal
                       (scan on upload)
```

### Two-tier catalog pattern

Countries, visa types, and form configs are stored in two places intentionally:

1. **Prisma collections** (`Country`, `Visa`, `VisaFormConfig`) — seeded baseline, queryable with full Prisma relations
2. **AdminConfig JSON blobs** — read at runtime by `content-catalog.ts`, editable by admin via the UI without schema migrations

When an admin edits catalog data through the UI, only the AdminConfig blobs update. The Prisma collections remain as a stable baseline. This supports live admin-editable content without code deployments.

### Session architecture

Three isolated JWT cookies, each verified independently on every request:

```
visahub_user_token      →  /user/*, /apply/*, /api/applications/*, /api/documents/*
visahub_supplier_token  →  /supplier/*, /api/supplier/*
visahub_admin_token     →  /admin/*, /api/admin/*
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 | Required by Next.js 16 |
| MongoDB Atlas | Free M0 cluster works for development |
| Cloudinary account | For document and avatar uploads |
| Razorpay account | Test mode keys work locally |

### 1. Clone and install

```bash
git clone https://github.com/your-org/visahub.git
cd visahub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values at minimum:

```bash
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/visahub
JWT_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

See the full [Environment Variables](#%EF%B8%8F-environment-variables) reference for all options.

### 3. Push schema to MongoDB

```bash
npm run db:push
```

### 4. Seed demo data *(development only)*

```bash
ADMIN_SEED_PASSWORD=Admin@1234 \
DEMO_SEED_PASSWORD=Demo@1234 \
SUPPLIER_SEED_PASSWORD=Supplier@1234 \
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

### Default login credentials *(after seed)*

| Role | Email | Password |
|---|---|---|
| Admin | `admin@visahub.com` | `$ADMIN_SEED_PASSWORD` |
| Applicant | `user@example.com` | `$DEMO_SEED_PASSWORD` |
| Supplier | `official@visahub.com` | `$SUPPLIER_SEED_PASSWORD` |

---

## ⚙️ Environment Variables

### Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/visahub` |
| `JWT_SECRET` | Min 32 chars, randomly generated | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Full public URL of the app | `https://visahub.com` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret | |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (browser-exposed) | |

**Cloudinary** — provide *either* signed credentials *or* an unsigned upload preset:

```bash
# Option A — Signed uploads (recommended for production)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Option B — Unsigned uploads (simpler setup, no server secret needed)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

### Optional (strongly recommended for production)

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP relay host |
| `SMTP_PORT` | Default: `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address — `"VisaHub" <no-reply@visahub.com>` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `REDIS_URL` | Redis URL for BullMQ job queue |
| `SENTRY_DSN` | Sentry server/edge DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry browser DSN |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload token (CI) |
| `VIRUSTOTAL_API_KEY` | File scanning API key — free tier: 500 req/day |
| `ACCELERATE_URL` | Prisma Accelerate URL for connection pooling |
| `COOKIE_SECRET` | Min 32 chars — hardens cookie signing |

### Development only *(never set in production)*

| Variable | Description |
|---|---|
| `ADMIN_SEED_PASSWORD` | Admin account password created during seed |
| `DEMO_SEED_PASSWORD` | Demo user password created during seed |
| `SUPPLIER_SEED_PASSWORD` | Supplier demo password (defaults to `DEMO_SEED_PASSWORD`) |

> ⚠️ `npm run db:seed` is guarded by `scripts/guard-seed.js` and will **hard-exit** if `NODE_ENV=production`.

---

## 🗄️ Database Setup

VisaHub uses MongoDB Atlas via Prisma. There are no SQL migration files — the schema is managed with `db push`.

### Push schema

```bash
npm run db:push
# Creates and updates all collections and indexes in MongoDB Atlas
```

### Seed demo data

```bash
npm run db:seed   # requires ADMIN_SEED_PASSWORD in .env.local
```

Seed creates: admin account, demo user, 2 demo suppliers, 5 countries, 14 visa types with full form schemas, default site content.

### Inspect data visually

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Regenerate Prisma client

```bash
npm run db:generate
# Runs automatically via postinstall hook on npm install
```

---

## 🧪 Running Tests

### Unit tests (Jest)

```bash
npm test                    # run all unit tests
npm run test:watch          # watch mode
npm run test:coverage       # with HTML coverage report
```

Coverage includes: Zod validation schemas, JWT sign/verify, CSRF token helpers, rate limiter logic, auth security utilities, route prefix matching.

### End-to-end tests (Playwright)

```bash
npx playwright install      # install browsers — first time only
npm run test:e2e            # headless run
npm run test:e2e:ui         # interactive Playwright UI mode
```

E2E scenarios: login, registration, email verification redirect, protected route guards, health check, API docs endpoint.

### Type checking

```bash
npm run typecheck           # tsc --noEmit
```

### Linting

```bash
npm run lint                # ESLint with Next.js ruleset
```

---

## 🚢 Deployment

### Production build

```bash
npm run typecheck   # verify types before building
npm run build       # Next.js production build
npm run start       # start on port 3000 (PORT env overrides)
```

---

### ▲ Vercel *(recommended)*

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Add all environment variables under **Settings → Environment Variables**
3. `postinstall` runs `prisma generate` automatically on each deploy
4. Run `npm run db:push` once after first deploy via Vercel CLI:

```bash
npx vercel env pull .env.local
npm run db:push
```

---

### 🚂 Railway / Render

```
Build command:  npm run build
Start command:  npm run start
```

Set all environment variables in the platform dashboard. After the first deploy, open a shell session and run `npm run db:push`.

---

### 🐳 Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
```

```bash
docker build -t visahub .
docker run -p 3000:3000 --env-file .env.production visahub
```

---

### ⚡ BullMQ workers *(optional)*

Deploy as a separate long-running service for async email and notification processing:

```bash
npm run workers
```

Without this, jobs execute inline synchronously. No data is lost — tasks complete before the request returns.

---

### ✅ Health check

```bash
curl https://your-domain.com/api/health
# → {"status":"ok","db":"connected","latencyMs":8}
# → HTTP 503 if database is unreachable
```

Use `/api/health` for load balancer probes and uptime monitors.

---

## 📡 API Reference

Interactive Swagger UI: **`/api/docs?ui=1`**  
Raw OpenAPI 3.1 spec (JSON): **`/api/docs`**

### Route map

| Area | Prefix | Auth |
|---|---|---|
| Public catalog | `GET /api/content/*` | None |
| User auth | `/api/auth/*` | None / cookie |
| Applicant — applications | `/api/applications/*` | User JWT |
| Applicant — documents | `/api/documents/*` | User JWT |
| Applicant — notifications | `/api/notifications/*` | User JWT |
| Applicant — profile | `/api/user/*` | User JWT |
| Supplier | `/api/supplier/*` | Supplier JWT |
| Admin | `/api/admin/*` | Admin JWT |
| Public supplier list | `GET /api/suppliers` | None |
| File upload | `POST /api/upload` | User JWT |
| Payments | `/api/payments/*` | User JWT |
| Razorpay webhook | `POST /api/payments/webhook` | HMAC signature |
| API v1 proxy | `/api/v1/*` | Same as underlying route |
| Health check | `GET /api/health` | None |
| API docs | `GET /api/docs` | None |

> All `POST`, `PUT`, `PATCH`, `DELETE` endpoints require an `x-csrf-token` header matching the `csrf-token` cookie. Exempt routes: `/api/payments/webhook`, `/api/auth/*`.

---

## 🔐 Security

| Control | Implementation |
|---|---|
| **Authentication** | JWT (`jose`) in HTTP-only cookies, verified in middleware and route handlers (defense in depth) |
| **Authorization** | Role-based — 3 isolated JWT cookies, each scoped to its own route group |
| **CSRF** | Double-Submit Cookie Pattern (`src/lib/csrf.ts`) on all mutating routes |
| **Input validation** | Zod schemas on every API input — no unchecked `req.json()` in production routes |
| **Password hashing** | bcrypt, cost factor 12 |
| **Rate limiting** | Sliding window — Upstash Redis (distributed, edge-safe), in-memory fallback for dev |
| **File scanning** | VirusTotal scan before Cloudinary upload — `422` returned on threat detection |
| **Env validation** | Zod schema validates all env vars at process startup |
| **Structured logging** | Pino JSON logs with PII field redaction |
| **Error monitoring** | Sentry on server, browser, and edge runtimes |
| **Webhook security** | Razorpay HMAC-SHA256 with `crypto.timingSafeEqual` |
| **Audit trail** | All admin mutations written to `AuditLog` collection |

### Production security checklist

- [ ] `JWT_SECRET` is ≥ 32 chars and randomly generated
- [ ] `DATABASE_URL` uses a dedicated DB user with least-privilege access (not Atlas root)
- [ ] MongoDB Atlas Network Access restricted to app server IPs
- [ ] `NODE_ENV=production` is set on the server
- [ ] `npm run db:seed` is never run in production
- [ ] Cloudinary API secret is server-only (not exposed client-side)
- [ ] SMTP credentials are not in source control
- [ ] `UPSTASH_REDIS_REST_URL` is set for distributed rate limiting
- [ ] `VIRUSTOTAL_API_KEY` is set (app logs a warning in prod if absent)
- [ ] `SENTRY_DSN` is set for error visibility
- [ ] HTTPS is enforced

---

## 📁 Project Structure

```
visahub/
├── e2e/                               # Playwright end-to-end tests
├── messages/                          # i18n JSON (en, hi, ar, de)
├── prisma/
│   ├── schema.prisma                  # All MongoDB data models and enums
│   └── seed.ts                        # Dev/staging seed script
├── public/                            # Static assets (country flag images)
├── scripts/
│   └── guard-seed.js                  # Blocks db:seed in production
├── src/
│   ├── app/
│   │   ├── (admin)/admin/             # Admin panel — 12 management sections
│   │   │   ├── applications/
│   │   │   ├── countries/
│   │   │   ├── dashboard/
│   │   │   ├── forms/                 # Dynamic form builder
│   │   │   ├── payments/
│   │   │   ├── suppliers/
│   │   │   ├── support/
│   │   │   ├── users/
│   │   │   └── visas/
│   │   ├── (auth)/                    # Login, register, verify email, forgot password
│   │   ├── (supplier)/supplier/       # Supplier portal — applications, notifications, profile
│   │   ├── (user)/user/               # Applicant portal — dashboard, applications, documents, billing
│   │   ├── api/                       # All REST API route handlers
│   │   └── page.tsx                   # Public landing page
│   ├── components/
│   │   ├── form/                      # Dynamic wizard form engine
│   │   │   ├── GenericWizard.tsx      # Core multi-step wizard
│   │   │   ├── WizardSectionForm.tsx  # Per-section field renderer
│   │   │   ├── WizardPayment.tsx      # Payment step
│   │   │   └── WizardReview.tsx       # Review and submit step
│   │   ├── forms/                     # Auth forms
│   │   ├── layout/                    # Navbar, footer, auth layout wrapper
│   │   └── ui/                        # Shared UI primitives (Button, Modal, Badge, etc.)
│   ├── hooks/                         # Custom React hooks
│   ├── lib/                           # Core server-side utilities
│   │   ├── api-client.ts              # Typed fetch wrapper for client → API calls
│   │   ├── application-tracking.ts    # Status transition logic
│   │   ├── audit.ts                   # Audit log writer
│   │   ├── cloudinary.ts              # Upload helpers
│   │   ├── content-catalog.ts         # Two-tier catalog reader
│   │   ├── csrf.ts                    # CSRF Double-Submit pattern
│   │   ├── jwt.ts                     # Token sign / verify
│   │   ├── prisma.ts                  # Prisma singleton + Accelerate support
│   │   ├── queue.ts                   # BullMQ job queue with inline fallback
│   │   ├── rate-limit.ts              # Upstash / in-memory rate limiter
│   │   ├── swagger.ts                 # OpenAPI 3.1 spec builder
│   │   ├── virustotal.ts              # File malware scanning
│   │   └── validation/                # Zod schemas per domain
│   ├── middleware.ts                  # JWT + CSRF + route protection
│   ├── providers/                     # React context providers
│   ├── store/                         # Zustand client stores
│   ├── types/                         # Shared TypeScript interfaces
│   └── env.ts                         # Zod env validation (process startup guard)
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── next.config.ts
├── playwright.config.ts
├── jest.config.ts
└── tsconfig.json
```

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. **Fork** the repository and clone your fork
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Make** your changes, following the conventions below
4. **Run** all checks before opening a PR:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run test:e2e
   ```
5. **Commit** using [Conventional Commits](https://conventionalcommits.org): `feat:`, `fix:`, `docs:`, `refactor:`
6. **Push** and open a Pull Request against `main`

### Code conventions

- All new API inputs must have a Zod schema in `src/lib/validation/`
- Use `logger` from `src/lib/logger.ts` — no `console.log` in production paths
- All state-mutating routes must call the CSRF middleware
- Admin actions that modify data must write to `AuditLog` via `src/lib/audit.ts`
- No raw `process.env` access — import from `src/env.ts`

---

## 📄 License

MIT © VisaHub Contributors. See [LICENSE](LICENSE) for full terms.

---

<div align="center">

Built with Next.js · Prisma · MongoDB · Tailwind CSS · Razorpay · Cloudinary

</div>
