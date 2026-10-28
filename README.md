# Toly

**Round up your toly. Unlock the table.**

Toly (from टोली, "a crew of friends") is a group-deals app for cafés, restaurants and activity venues in Kathmandu Valley.

- **Tolys:** a customer starts a toly from a venue's deal and shares the link. When every seat is filled by a verified phone number, the group price unlocks as a voucher. Vouchers stay valid until used unless the venue sets a limit, and picking a day is optional.
- **Toly Spin:** customers pay a small fee to spin a venue's wheel and win a discount voucher, from a few percent off an item to the whole bill. Every spin wins, and the odds are shown before paying.
- **Counter:** venue staff scan the customer's rotating QR (or type the short code), check it, then redeem it once. The customer pays the venue directly; Toly never handles the bill.
- **Venues** get a dashboard: deals, wheel, staff, insights (views → tolys → redemptions), and a printable counter poster.

The original product and compliance blueprint lives in [`docs/blueprint.md`](docs/blueprint.md).

## Architecture

```
                 ┌──────────────── Caddy (TLS, X-Real-IP) ────────────────┐
 browser ──────▶ │  /api/*  ─────────────▶  apps/api  (Hono on Node 24)   │
                 │  /*      ─▶ apps/web (Next.js 16) ──server calls──▶ api│
                 └────────────────────────────────────────────────────────┘
                                   apps/api ──▶ Postgres (Neon) · Redis
                                            ──▶ Sparrow SMS · Khalti
```

| Path | What it is |
|---|---|
| `apps/web` | Next.js 16 App Router, Cache Components, React Compiler, Tailwind 4, shadcn/ui on Base UI |
| `apps/api` | Hono API with Better Auth, typed RPC client exported to the web app, bundled to a single `dist/` |
| `packages/db` | Drizzle schema, migrations, seed |
| `packages/shared` | Zod schemas and pure logic shared by both apps (phone, money, deals, spins, availability) |
| `packages/tsconfig` | Shared TypeScript config |
| `deploy/` | Caddyfile and production compose file |

Browsers only ever talk to one origin. In development, Next rewrites `/api/*` to the API; in production Caddy routes it.
Session cookies are therefore first-party, and server components call the API directly with the visitor's cookies.

## Security model

- **Sign-in:** phone OTP (Nepali mobiles only), passkeys (WebAuthn, including autofill), optional Google. No passwords.
- **OTP:** 6 digits, 5-minute expiry, 5 attempts, 3 sends per 10 minutes per IP in production (local dev has no edge proxy to supply the IP), optional Cloudflare Turnstile. With Redis, codes never touch Postgres; identifiers are stored hashed.
- **Sessions:** `toly`-prefixed HttpOnly cookies, `Secure` in production, 30 days with daily rotation; users can see and revoke devices.
- **Admins** must have a passkey; the role is re-read from the database on every admin request.
- **CSRF:** Better Auth origin checks plus Hono's CSRF middleware on `/api/v1`.
- **Rate limits** key on the user, or on `CLIENT_IP_HEADER`, which the edge proxy overwrites. Never trust `X-Forwarded-For` from clients.
- **Seats and vouchers:** joins lock the group row (exactly one winner for the last seat, one voucher); redemption locks the voucher row (scans and retries never double-redeem); daily caps and spin stock are counted under advisory locks. All covered by Postgres integration tests.
- **QR codes** are HMAC-signed and expire after about a minute, so screenshots go stale; codes from another venue get the same "not valid here" answer.
- **Spins** are drawn server-side with `crypto.randomInt` only after the payment provider confirms the exact amount by server-side lookup. Browser redirects are never trusted.
- **Privacy:** invite links show first names only; phone numbers are never exposed to other customers or other venues.
- Security headers on every page (frame-ancestors none, nosniff, strict referrer, HSTS in production); privileged actions are audit-logged.

## Run it locally

Requirements: Node 24, pnpm 11 (via Corepack), and Postgres. Redis is optional in development.

```bash
corepack enable
pnpm install
cp .env.example .env              # set DATABASE_URI and BETTER_AUTH_SECRET at minimum
docker compose up -d              # local Postgres and Redis, or point DATABASE_URI at Neon
pnpm db:migrate
pnpm db:seed                      # two demo venues with deals and spin wheels
pnpm dev                          # web on :3000, api on :4000
```

Sign in with any Nepali mobile number. In development, SMS codes print in the API log (`[sms] to=…`).
Seeded venue owner: `9800000001`. To make yourself an admin, sign in once, add a passkey on `/account`, then run:

```bash
pnpm --filter @toly/api admin:grant 98XXXXXXXX
```

Spin payments use a mock checkout in development (`PAYMENTS_PROVIDER=mock`). Production refuses to start with the mock.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run web and API with hot reload |
| `pnpm lint` / `pnpm format` | Biome check / fix |
| `pnpm typecheck` | Type-check every package |
| `pnpm test` | Unit tests, plus API integration tests when `TEST_DATABASE_URI` is set |
| `pnpm build` | Production builds (Next standalone, bundled API) |
| `pnpm db:generate` / `pnpm db:migrate` | Create / apply Drizzle migrations |

Integration tests need an empty Postgres database:

```bash
TEST_DATABASE_URI=postgresql://toly:toly@localhost:5432/toly_test pnpm test
```

## Deploy

For the mock demo at `toly.page` on Netlify, Render Free and Neon Free, see [the demo deployment guide](docs/demo-deployment.md). It uses an explicit `DEMO_MODE=true` flag and a separate synthetic database while keeping production cookies and rate limits enabled.

The repo builds two small images: the API bundles every dependency (around 10 MB of JavaScript, no `node_modules`), and the web app uses Next's standalone output. CI builds both on every pull request.

```bash
# On the server, from the repo root, with a production .env
docker compose -f deploy/docker-compose.yml --env-file .env run --rm migrate
docker compose -f deploy/docker-compose.yml --env-file .env up -d --build
```

Production checklist:

- `NODE_ENV=production`, a fresh `BETTER_AUTH_SECRET`, `WEB_URL=https://your-domain`, `TOLY_DOMAIN=your-domain`
- `SMS_PROVIDER=sparrow` with a tested sender ID on NTC and Ncell
- `PAYMENTS_PROVIDER=khalti` with a live `KHALTI_SECRET_KEY` and `KHALTI_API_URL=https://khalti.com/api/v2`
- Google OAuth redirect URI `https://your-domain/api/auth/callback/google`
- Keep the API reachable only through Caddy, so `X-Real-IP` can't be forged
- Postgres backups and point-in-time recovery (Neon provides both)

## Before launch

Toly Spin is a paid, chance-based prize. Every spin wins, odds are published and spins are capped per person per day, but have a Nepal-qualified lawyer confirm how it is classified before taking real payments. See `docs/blueprint.md` for the wider legal, tax and e-commerce checklist.
