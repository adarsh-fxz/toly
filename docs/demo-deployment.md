# Toly public demo

The demo runs at `https://toly.page` using Netlify (Next.js), a Render Free Node service (API, Singapore), and a separate Neon Free PostgreSQL project named `toly-demo` (Singapore). Name.com hosts the DNS.

## Demo behavior

- Keep `NODE_ENV=production` on the API and set `DEMO_MODE=true` on both hosts.
- Sign in with a shared synthetic number from `9800000000` to `9800000999`. The form shows the generated, single-use code; no SMS is sent. Use made-up names only. Seeded owner: `9800000001`; customers: `9800000002` and `9800000003`.
- Payments use the mock checkout. Deals, venues and vouchers are samples; nothing can be redeemed at a real venue.
- Demo mode rejects real SMS/payment providers and Google OAuth. Passkey enrollment is disabled for shared identities. Secure cookies, origin checks and rate limits remain enabled.
- All demo accounts and activity are shared. Never connect this deployment to a database containing real users or real venue records.
- Render sleeps after 15 minutes idle. Its in-memory mock checkouts disappear on restart; start a fresh checkout if one expires. The API also runs expiry jobs while awake; group and voucher operations still check expiration at use time.
- Redis is omitted for this single-instance demo: Better Auth stores sessions, OTPs and auth rate limits in PostgreSQL; other limits use process memory.

## Hosts

`render.yaml` records the API settings. The initial Render UI deployment uses the public Git repository; check the dashboard's auto-deploy status rather than assuming Git updates trigger a build. Its start command runs the existing migrations and idempotent synthetic seed before listening. Keep `BETTER_AUTH_SECRET` in Render; never put it in Netlify or public source. `DATABASE_URI` belongs only in Render and points to the dedicated demo project.

In Netlify, select `apps/web` as the package directory and leave the base at the repository root. `netlify.toml` sets the build command and output. Add these UI environment variables for both **builds and functions**:

| Variable | Value |
| --- | --- |
| `API_URL` | The API's actual `https://…onrender.com` URL |
| `WEB_URL` | `https://toly.page` |
| `DEMO_MODE` | `true` |
| `NODE_VERSION` | `24.21.0` |
| `PNPM_VERSION` | `11.5.0` |

`API_URL` is compiled into the Next.js rewrite and also used by server components. Redeploy the frontend after changing it. Browsers send API calls through `toly.page/api/*`; no cross-origin session cookies or API subdomain are needed.

Add `toly.page` as Netlify's primary domain and `www.toly.page` as its alias. Use Netlify's displayed external DNS records at Name.com. Preserve email/TXT records and existing nameservers. Check DNS and certificate provisioning before declaring the domain live.

## Verification

Check API `/health/ready`, catalogue and wheels; load the homepage, deals and sign-in at the custom domain; complete synthetic OTP sign-in and a mock spin; confirm a secure session cookie, the demo banner and disabled indexing. Confirm real phone numbers are rejected and unauthenticated merchant/admin routes are protected.

Local validation uses an isolated disposable PostgreSQL database:

```bash
pnpm lint
pnpm typecheck
TEST_DATABASE_URI=postgresql://toly:toly@localhost:5432/toly_deploy_test pnpm test
DEMO_MODE=true API_URL=https://YOUR_API.onrender.com WEB_URL=https://toly.page pnpm --filter @toly/web build
```

Do not pass a live database to the tests: they truncate application tables.

For a real launch, disable demo mode on both hosts, remove the demo settings in `netlify.toml`, use a new real database, and configure real SMS and payments. Keep the demo database separate.
