# VisaHub — Production Deployment Guide

> **Stack**: Next.js 15 · Prisma (MongoDB) · JWT auth · Cloudinary · Nodemailer

---

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 | Required by Next.js 15 |
| MongoDB Atlas cluster | Free tier works for dev; M10+ for production |
| Cloudinary account | For document/logo uploads |
| SMTP provider | Resend, Postmark, SendGrid, or any SMTP relay |

---

## 2. Environment Variables

Copy `.env.example` → `.env.local` (dev) or set as platform secrets (prod).

```bash
cp .env.example .env.local
```

### Required variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string — `mongodb+srv://...` |
| `JWT_SECRET` | Min 32 random chars — `openssl rand -base64 32` |
| `ADMIN_SEED_PASSWORD` | Admin account password set during seed (dev only) |

### Optional but recommended for production

| Variable | Description |
|---|---|
| `APP_URL` | Full public URL e.g. `https://visahub.com` |
| `SMTP_HOST` | SMTP relay host |
| `SMTP_PORT` | Default: `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address e.g. `"VisaHub" <no-reply@visahub.com>` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `DEMO_SEED_PASSWORD` | Sets demo user password during seed (dev only) |
| `SUPPLIER_SEED_PASSWORD` | Sets demo supplier passwords (defaults to `DEMO_SEED_PASSWORD`) |

---

## 3. Database Setup

### 3a. Push schema to MongoDB

MongoDB (via Prisma) uses `db push` — no migration files needed.

```bash
# Install deps (also runs prisma generate via postinstall)
npm install

# Push all Prisma models to MongoDB Atlas
npm run db:push
```

`db:push` creates/updates all collections and indexes defined in `prisma/schema.prisma`:
- `User`, `Supplier`, `Country`, `Visa`, `VisaFormConfig`
- `Application`, `ApplicationStatusLog`, `ApplicationDocument`
- `Payment`, `Document`, `Notification`, `SupplierNotification`
- `PasswordResetToken`, `SupportTicket`, `TicketReply`
- `AdminConfig`, `AuditLog`

### 3b. Seed initial data

**Only run in development / staging — never production.**

```bash
# Requires ADMIN_SEED_PASSWORD set in .env.local
npm run db:seed
```

Seed creates:
- Admin user at `admin@visahub.com`
- Demo user at `user@example.com` (if `DEMO_SEED_PASSWORD` set)
- 2 demo suppliers (if `SUPPLIER_SEED_PASSWORD` or `DEMO_SEED_PASSWORD` set)
- 5 countries (US, GB, CA, AE, DE) into both `Country` collection and `AdminConfig` blob
- 14 visa types into `Visa` + `VisaFormConfig` collections and `AdminConfig` blob
- All form schemas into `VisaFormConfig` collection and `AdminConfig` blob
- Default site content into `AdminConfig`

### 3c. Inspect data

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 4. Local Development

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run db:push
npm run db:seed              # ADMIN_SEED_PASSWORD must be set
npm run dev                  # starts at http://localhost:3000
```

Default dev credentials (after seed):
- **Admin**: `admin@visahub.com` / your `ADMIN_SEED_PASSWORD`
- **User**: `user@example.com` / your `DEMO_SEED_PASSWORD`
- **Supplier**: `official@visahub.com` / your `SUPPLIER_SEED_PASSWORD`

---

## 5. Production Build

```bash
npm run typecheck   # catch type errors before build
npm run build       # Next.js production build
npm run start       # start on port 3000 (set PORT env to override)
```

---

## 6. Deployment Platforms

### Vercel (recommended)

1. Import repo into Vercel
2. Set all env vars under **Settings → Environment Variables**
3. Vercel auto-runs `npm install` (triggers `postinstall → prisma generate`)
4. Add a build command override if needed: `npm run build`
5. Set **Output Directory** to `.next`

**Note:** `db:push` and `db:seed` must be run manually or via a one-off job — Vercel build does not run them.

### Railway / Render

1. Connect GitHub repo
2. Set env vars in the platform dashboard
3. Build command: `npm run build`
4. Start command: `npm run start`
5. Run `db:push` via a one-off job or SSH into the instance once after initial deploy

### Docker

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

---

## 7. Health Check

After deploy, verify the app is connected to MongoDB:

```bash
curl https://your-domain.com/api/health
# → {"status":"ok","db":"connected","latencyMs":12,...}
```

Returns `503` if DB is unreachable. Use this URL for:
- Load balancer health checks (AWS ALB, Vercel, Railway)
- Uptime monitors (UptimeRobot, Betterstack, etc.)

---

## 8. API Route Map

| Area | Prefix | Auth |
|---|---|---|
| Public catalog (countries, visas, forms) | `/api/content/*` | None |
| User auth | `/api/auth/*` | None / User cookie |
| User dashboard | `/api/applications/*`, `/api/documents/*`, `/api/notifications/*`, `/api/user/*` | User JWT |
| Supplier dashboard | `/api/supplier/*` | Supplier JWT |
| Admin panel | `/api/admin/*` | Admin JWT |
| Supplier list (public) | `/api/suppliers` | None |
| File upload | `/api/upload` | User JWT |
| Health check | `/api/health` | None |

---

## 9. Data Architecture Notes

### Two-tier catalog pattern

Countries, visas, and form configs are stored in **two places**:

1. **Proper Prisma collections** (`Country`, `Visa`, `VisaFormConfig`) — single source of truth, seeded by `db:seed`, queryable with Prisma relations
2. **AdminConfig JSON blobs** (`admin_catalog_countries`, `admin_catalog_visas`, `admin_form_configs`) — read by `content-catalog.ts` at runtime, editable by admin via the UI

When admin edits catalog data via the UI, only the AdminConfig blobs are updated. The proper collections remain as the seed baseline. This is intentional: it supports admin-editable content without complex migrations.

### JWT sessions

Three separate cookies (configurable via env):
- `visahub_user_token` — regular user
- `visahub_admin_token` — admin
- `visahub_supplier_token` — supplier

All JWTs are verified on every request in `src/lib/get-session.ts`.

### Document uploads

Files go to **Cloudinary**. The `publicId` is stored in `Document.publicId` so files can be deleted when a document is removed. Without Cloudinary credentials, uploads will fail — configure `CLOUDINARY_*` env vars before going live.

---

## 10. Security Checklist

- [ ] `JWT_SECRET` is at least 32 chars and generated randomly
- [ ] `DATABASE_URL` uses a dedicated DB user with least-privilege (not root)
- [ ] MongoDB Atlas Network Access restricted to app server IPs
- [ ] `NODE_ENV=production` set on server
- [ ] Seed script (`npm run db:seed`) never runs in production (guarded by `scripts/guard-seed.js`)
- [ ] Cloudinary API secret not exposed to the client
- [ ] SMTP credentials not in source control
- [ ] Rate limiting active (`src/lib/rate-limit.ts` — Upstash or in-memory fallback)
- [ ] HTTPS enforced (Vercel/Railway handle this automatically)

## Payment Setup (Razorpay)
1. Create account at https://razorpay.com
2. Copy Key ID and Key Secret from Dashboard > Settings > API Keys
3. Set env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID
4. Add webhook endpoint /api/payments/webhook in Razorpay dashboard (optional, for async confirmation)

## Email Verification
Users who register will receive a verification email before they can log in.
The flow uses /api/auth/send-verification and /api/auth/verify-email.
The EmailVerificationToken model must be present in your Prisma schema.

## robots.txt + sitemap.xml
These are auto-generated by Next.js via src/app/robots.ts and src/app/sitemap.ts.
Set APP_URL env var so URLs are correct in production.

