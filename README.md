# VisaHub

VisaHub is a Next.js App Router project for user, supplier, and admin visa workflows.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env.local
```

3. Fill required env vars in `.env.local` (`DATABASE_URL`, `JWT_SECRET`, Cloudinary keys, etc).

4. Run development server:

```bash
npm run dev
```

## Database Seed

- `db:seed` is guarded and exits with an error when `NODE_ENV=production`.
- `ADMIN_SEED_PASSWORD` is required to seed the admin account.
- Optional demo user seeding requires `DEMO_SEED_PASSWORD`.

```bash
npm run db:seed
```

## Security Notes

- Next.js 16 uses `src/proxy.ts` for request interception (the old `middleware.ts` convention is deprecated).
- JWT verification is intentionally performed in both proxy and route session helpers as defense in depth.
