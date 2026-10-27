# GroupUnlock Nepal 🇳🇵

**Unlock better local deals together.**

> **Status:** Product and technical blueprint — **not yet implemented**, audited, commercially validated, or legally approved.  
> **Market:** Nepal; initial launch in a small set of Kathmandu Valley neighborhoods.  
> **Document updated:** 27 October 2026.  
> **Core principle:** **Customers pay the merchant directly. GroupUnlock does not collect, escrow, or distribute customers' purchase money in V1.**

## 0. Executive decision log

| Decision | V1 choice | Why |
|---|---|---|
| Product | Time-boxed, group-unlocked **merchant offers** for dining and low-complexity activities | Obvious sharing loop and testable merchant ROI |
| First use case | **Group dining bundle**: a party of 2–6 fills a slot, unlocks a fixed advertised offer, and pays one bill at the venue | Clear operational rules; avoids shipping/inventory |
| Payment for offer | **Directly to merchant** by their cash/card/bank/approved QR method | No platform custody, pooled funds, or refunds for failed groups |
| Payment to GroupUnlock | Merchant subscription or campaign fee billed separately by GroupUnlock | Straightforward B2B value proposition; platform is merchant of record for its own SaaS services |
| Authentication | **Google OAuth first**; verify **Nepali mobile number** before joining/creating a redeemable group | Low initial friction plus stronger uniqueness and recovery signals |
| Phone delivery | Supabase Auth or a dedicated verification service with Nepal-capable SMS provider; test actual carrier delivery | International OTP coverage cannot be assumed |
| Application | Responsive **web/PWA first**, not native mobile | Shared links should open instantly in WhatsApp/Messenger |
| Backend | **TypeScript modular monolith** with background worker | Faster to build and operate than microservices |
| Database | PostgreSQL + Drizzle ORM | Transactions, constraints, audited state changes |
| MVP geography | One area, **10 signed merchants**, restricted offer inventory | Solve two-sided marketplace cold start locally |
| V1 excluded | Buyer deposits, consumer wallet, advance payments, delivery, cross-merchant split settlement, crypto, complex loyalty points | Avoid unnecessary legal, security and support risk |

---

## 1. The problem, the customer, and the wedge

**Consumer problem:** Discounts are scattered, often hard to trust, and not naturally designed for group outings. Friends already coordinate in chats; they want a definite price and clear conditions before showing up.

**Merchant problem:** Small restaurants and activity venues want incremental customers during low-demand hours, not just clicks, followers, or blanket discounts to existing buyers.

**Product thesis:** A merchant can create limited **group-only offers** restricted by branch, schedule, available seats, and maximum redemptions. One person shares a group link; enough **unique, confirmed members** join; the merchant confirms availability; the group receives a short-lived voucher; the group shows up and pays the merchant directly.

**What we are NOT:** A generic coupons directory, delivery business, pre-paid group buying service, or wallet.

### Competitive reality: differentiation must be proven

- [BiteOut](https://biteout.app/) already offers restaurant deal discovery and redemption in Kathmandu Valley; its current site describes free membership and straightforward bill discounts. We must **not** pretend local dining deals are unserved.
- [Students Club Nepal](https://studentclubnepal.com/) offers student discounts and merchant QR redemption. We target **friends coordinating a real group booking**, not student eligibility or generic discount listings.
- Social media groups, Instagram deals, restaurant loyalty schemes, and direct merchant WhatsApp reservations are also substitutes.

**Defensible wedge to test:** GroupUnlock produces **measurable incremental group visits at off-peak times**, at a total cost to the merchant below their alternative acquisition channel. The viral mechanic is a hypothesis, not a guaranteed growth engine.

### Target segments

1. **Initial buyers:** 18+ students, young workers, and friend groups arranging casual meals or activities in Kathmandu Valley. Do not market as a service exclusively for minors.
2. **Initial sellers:** Independently owned cafés, casual restaurants, dessert venues, karaoke, board-game cafés, and low-risk activities with spare capacity and predictable group packages.
3. **Later:** Fitness class trials, workshops, co-working day passes, and local experiences. Each category will need its own fulfillment rules and compliance checks.

### Sample merchant economics (illustrative; negotiate before publishing)

- Menu price of a bundle: NPR 1,600.
- Limited group price: NPR 1,200 for four people.
- Merchant estimates gross contribution after ingredients/labor at this price and sets an off-peak cap.
- Customer sees *full bundle price and included items*, not an ambiguous per-person discount.
- GroupUnlock earns **no cut of the NPR 1,200** in V1. The merchant receives payment directly and separately pays GroupUnlock a subscription or campaign invoice.

**Important:** A 25% discount is **not** automatically a profitable merchant deal. The merchant must approve contribution margin, eligible dayparts, taxes, availability, and total inventory. Never invent a crossed-out “usual price” without substantiation.

---

## 2. Precise V1 product specification

### Shopper journey

1. Open a **public, SEO-accessible deal page** from a shared link; see seller identity, exact offer, final group price, minimum party size, location, slot, expiry, exclusions and complaint route.
2. Tap **Start group**; sign in with Google if needed; complete verified Nepali phone linking before a slot is held.
3. Choose an available merchant-approved date/time slot and start a group, e.g. **4 seats / 30-minute formation window**. An invitation link is generated.
4. Friends open the link, see price and rules, authenticate, verify their phone, and explicitly join. A user cannot fill multiple seats with one account.
5. On reaching the threshold, the server atomically **locks membership**, requests or checks merchant slot confirmation, and produces one **group redemption entitlement** with a limited validity period.
6. Organizer brings the group to the venue. The merchant scans/enters a rotating QR or short redemption code in their authenticated merchant screen.
7. Merchant validates eligibility and **claims the voucher for this visit** (time-limited server-side lock). Staff applies the agreed discount, fulfills the package and collects **direct payment** through the merchant’s own POS/QR/cash desk. Staff finalizes **redeemed** only after the venue confirms the transaction; payment is merchant-attested, not independently verified by GroupUnlock.
8. Members can report a problem, view status, and optionally leave **verified-visit feedback** (not fabricated reviews). Merchant and admin dashboards show outcomes.

**V1 scope clarification:** One *group* qualifies for **one bundle / one bill**, not four independent coupons. The friends decide among themselves who pays. We do **not** offer in-app split-bill collection.

### Merchant journey

1. Apply with business name, physical location, legal name, contact, PAN/VAT details, registration evidence, and responsible staff contact.
2. Admin verifies documents and venue existence; merchant signs listing, discount, cancellation, service and data-processing terms.
3. Merchant creates a **draft deal** with: bundle contents; normal and discounted prices; inclusive taxes; eligibility; available days/hours; max group size; slot capacity; per-day redemption limit; booking lead time; no-show policy; blackout dates; and end date.
4. System rejects missing/misleading terms; admin approves for first pilot. Later trusted merchants may self-publish within limits.
5. Staff member uses **merchant redemption mode** to scan or enter a code, verify party, honor offer, and record fulfillment / no-show / complaint.
6. Owner sees views, group starts, completed groups, unique visitors (reported accurately), merchant-confirmed redemptions, complaints and billable fees.

### Administrator journey

- Review/KYC merchants, approve offer changes, set quotas, resolve complaints and handle abuse.
- Pause a deal or suspend a merchant with an audit trail and notifications to impacted users.
- Reconcile redemptions with merchants before sending invoices; keep claims such as “revenue generated” separate from evidence-backed metrics.
- Review privacy requests, suspicious account clusters, refund complaints referred to the merchant, support SLAs, and operational incidents.

### Non-goals for launch

- Holding seats at every restaurant's external reservation system; integration is not assumed.
- Direct verification of the customer's static QR payment. A QR screenshot or user-submitted payment image is **not** proof of settlement.
- Guaranteed restaurant revenue, guaranteed reservation until accepted, or guaranteed availability after a merchant refuses a slot.
- Automatic penalties for no-shows; there is no prepaid money to charge.
- Auto-generated crowdsourced listings or unlicensed merchant advertisements.

---

## 3. Canonical rules and edge cases

### Deal and slot rules

- All money is stored as **integer minor units** when a gateway requires them; for NPR product prices stored as integer **paisa** or numeric decimal with explicit currency — choose one convention system-wide (`money_paisa BIGINT`). UI formats `NPR`/`रू`; do not use binary floats.
- A deal has an immutable **versioned price/terms snapshot** when a group starts. Editing a live deal produces a new version and cannot silently change existing groups.
- Merchant supplies approved `party_size_required`, `booking_slots`, `slot_capacity_groups`, `minimum_spend` if applicable, and `allowed_booking_window`.
- Offer never advertises a discount without an authentic regular-price reference and actual restrictions.
- Group formation closes after **30 minutes** by default; slot is typically **at least 2 hours** after lock (tune in pilot).
- A group reaching capacity becomes `FILLED`; only merchant-confirmed groups become `CONFIRMED` and receive the redeemable voucher.
- Merchant may decline within an agreed period (e.g. 10 min); members receive clear notice and may create another group; no refunds are needed because no charge occurred.
- Limit group size and number of seats per verified account; unexpired simultaneous group-joining quotas minimize seat hoarding.
- Slot inventory is held/reserved atomically. Holds expire; repeated joins cannot overbook a slot or generate extra vouchers.
- Valid group membership does **not** imply verified attendance; attendance and payment are distinct events.
- Cancellation/no-show behavior is displayed before joining. On merchant closure or dispute, entitlements stop and support is offered. Do not falsely claim a booking was honored.

### Trust and safety rules

- Joining should require **verified phone**; Google login alone does not give unique-human assurance. Neither a phone number nor device fingerprint proves a unique person; apply reasonable rate limits and manual review for suspicious patterns.
- Group links are **opaque random tokens**, not sequential identifiers; do not expose full member phone numbers or email addresses.
- QR redemption code binds to `(group_id, deal_version_id, slot_id, branch_id, expiration, nonce)`; it cannot be reused for another campaign.
- Redemption needs merchant authorization **and** a trusted server-side transactional state change. Screenshots alone cannot redeem; QR images can be replayed without online validation.
- If device/network is offline, merchant **does not redeem offline** in V1. Offer staff a manual support procedure and explain the outage.
- Merchant cannot unilaterally inflate verified *customer arrivals*. Record who attested what, and separate the status `merchant_confirmed` from `independently_verified`.
- A redeemed voucher is one-use; retrying a callback or rescanning must return the **same result**, never a second billable redemption.
- Merchant and platform staff may not collect unnecessary identity documents from shoppers.

---

## 4. Architecture

### 4.1 Recommended stack

| Layer | Technology | Rationale |
|---|---|---|
| Web / PWA | Next.js App Router + TypeScript + Tailwind CSS + accessible component system | SEO deal pages, fast link sharing and merchant/admin panels |
| API | TypeScript route handlers / Hono hosted in the same Node service | Modular code, validation and RBAC; **one deployable application** initially |
| Auth | Supabase Auth: Google OAuth and phone verification; secure server-side session handling | Standard OIDC and session lifecycle; supports custom Send SMS Hook |
| SMS | Nepal-capable gateway **e.g. Sparrow SMS**, after carrier delivery and OTP testing | Improve local reach; provider-specific integration behind adapter |
| Database | Managed PostgreSQL, Drizzle ORM migrations | Referential integrity and transactional seat allocation |
| Background jobs | Redis + BullMQ worker (or durable managed queue) | Group expirations, invitations, reconciliation, email, invoices |
| Assets | Private S3-compatible object storage; signed uploads/downloads | Store merchant KYC documents without public exposure |
| Edge / security | CDN, WAF, bot challenges / Turnstile and rate limiting | Share traffic spikes and OTP abuse |
| Email | Transactional email service | Merchant invoices and operational alerts |
| Monitoring | Sentry + OpenTelemetry traces + uptime/log alerts | End-to-end incident investigation |
| Product analytics | Consent-aware first-party events / PostHog | Measure acquisition, fulfillment and repeat usage |
| Infrastructure | AWS Mumbai (`ap-south-1`) as default planning target; managed services, containers and IaC | India proximity; **benchmark Nepal latency and provider availability before commitment** |

**Avoid early:** Kubernetes, microservices, event sourcing everywhere, blockchain, buyer wallets, a GraphQL gateway, native apps, and a custom OAuth implementation.

### 4.2 Deployment architecture

```mermaid
flowchart TB
    U[Customer mobile browser / PWA]
    M[Merchant dashboard / redemption scanner]
    A[Admin dashboard]
    CDN[CDN + WAF + TLS + rate limits]
    APP[Next.js Node application\nSEO pages + typed APIs + RBAC]
    AUTH[Supabase Auth\nGoogle OAuth + phone verification]
    DB[(Managed PostgreSQL\ntransactions + audit + outbox)]
    Q[(Redis / BullMQ)]
    WORKER[Background worker\nexpiry + messages + invoice jobs]
    STORE[(Private object storage\nKYC + permitted images)]
    SMS[Nepal SMS gateway]
    EMAIL[Transactional email]
    PSP[Khalti / eSewa\nGroupUnlock's own B2B invoices]
    POS[Merchant's own POS / bank / QR\ncustomer pays merchant directly]
    OBS[Logs + traces + error monitoring]

    U --> CDN
    M --> CDN
    A --> CDN
    CDN --> APP
    APP <--> AUTH
    APP <--> DB
    APP --> Q
    Q --> WORKER
    WORKER <--> DB
    WORKER --> SMS
    WORKER --> EMAIL
    APP <--> STORE
    APP <--> PSP
    M --> POS
    U --> POS
    APP --> OBS
    WORKER --> OBS
```

**Payments boundary:** The arrow from the **customer to merchant POS/QR** does **not** pass through GroupUnlock. The PSP integration exists for **a merchant paying GroupUnlock** for GroupUnlock's own subscription/invoice, unless later specifically approved for a different flow.

### 4.3 Logical modules (single codebase)

- `identity`: session validation, profile, phone verification, roles, account linking.
- `merchant`: legal data, verification, branches, staff membership.
- `catalog`: deals, versioning, price validation, category, SEO and media.
- `availability`: inventory, booking slots, capacity, calendar restrictions.
- `groups`: invites, membership, expiry, joins, lock and confirmation.
- `redemption`: QR/code, immutable entitlement, atomic consumption.
- `billing`: **merchant → GroupUnlock** subscriptions, invoice/payment status, reconciliation.
- `support`: reports, complaints, moderation, refunds handled by merchant.
- `analytics`: privacy-safe funnel and merchant reporting.
- `platform`: rate limits, background jobs, notifications, audit, idempotency and outbox.

**Auth/database boundary:** Supabase Auth maintains its own managed authentication storage; the application PostgreSQL stores an `auth_user_id` reference and must verify identity through supported Auth APIs/JWT validation. Do not assume foreign keys across separate providers/databases.

**Architectural rule:** Feature packages expose service methods rather than importing one another's SQL tables directly. All user/merchant permission checks run on the server; hiding buttons is never sufficient.

### 4.4 Sequence: group formation and redemption

```mermaid
sequenceDiagram
    participant O as Organizer
    participant F as Friends
    participant API as GroupUnlock API
    participant DB as PostgreSQL
    participant J as Worker
    participant V as Merchant staff
    participant PAY as Merchant payment method

    O->>API: Start group for deal version and slot
    API->>DB: Transaction: verify slot capacity; reserve tentative group
    API-->>O: Opaque invite URL, expiry
    F->>API: Sign in, verify phone, join link
    API->>DB: Transaction: lock group row; unique join; count seats
    DB-->>API: Group now full
    API->>J: Outbox event: group filled
    J-->>V: Confirm the slot (or use preapproved auto-confirm rules)
    V->>API: Confirm within TTL
    API->>DB: Transaction: confirm group + issue voucher
    API-->>O: Voucher and location instructions
    O->>V: Show rotating code/QR and arrive with party
    V->>API: Validate token and claim visit (expiring lock)
    API->>DB: Atomic claim with branch and member checks
    API-->>V: Claim ID + approved discounted price
    V->>O: Fulfill package / issue discounted bill
    O->>PAY: Pay merchant directly
    V->>API: Finalize with merchant-attested payment/fulfillment
    API->>DB: Atomic single-use redemption and audit event
    API-->>V: Redeemed; receipt stays with merchant
```

**Sequence detail:** Staff validation and the temporary claim happen before payment; final redemption happens after the merchant confirms delivery/payment. A failed payment must not consume the voucher: staff cancel the claim or its time limit expires. A restaurant visit can span many minutes, so choose a claim TTL appropriate to the service (for example, 90 minutes) and show it to staff. Distinguish `redeemed`, `service_delivered`, and `merchant_reported_paid`: GroupUnlock cannot truthfully certify payment without PSP-integrated evidence.

---

## 5. Identity, authentication and authorization

### Recommended login UX

1. **View deal and share it without an account.**
2. On `Join` / `Start group`: **Continue with Google** (fast path, fully working OAuth PKCE / server callback); offer **Continue with phone** once local OTP reliability is demonstrated.
3. For group membership/redemption eligibility: require one **verified Nepali number** (+977), with OTP. Users who only have a Google account can browse but not occupy a group seat.
4. For merchant owners: verified work email/contact phone, business validation and a separate organization membership. For admins: phishing-resistant MFA, short sessions, allowlisted operations where practical.

### Why Google + phone, not just one

- Google avoids passwords and reduces initial signup friction.
- Verified phone improves communication and increases cost of trivial duplicate accounts, but is **not proof of identity**.
- A phone-only login can be added after comparing OTP delivery, price per message, SIM churn and account recovery risks across **NTC and Ncell**. Do not promise the OTP works for every SIM without live tests.
- Do **not** use Google OAuth access tokens as application JWTs; validate Supabase-issued sessions server-side.

### Auth implementation requirements

- Use official Supabase OAuth PKCE/SSR integration with secure cookie/session management; allowlist redirect origins and prevent open redirects.
- Trust only verified Google `sub` as the external identity key; email may change. Store internal user ID, provider ID and phone E.164 separately.
- Create account profile **idempotently** after verified sign-in. Never auto-merge two separate users solely because profile names match.
- Phone linking uses authenticated session, challenge expiry (~5 min), one-use verification, resend cooldown, per-phone/IP/user quotas, bot challenge, and a maximum attempts counter.
- Implement provider-specific SMS adapter. Supabase's **Send SMS Hook** supports custom regional providers, but validate hook signature, production compatibility and delivery failure behavior. If the hook cannot support required account-linking behavior, use a dedicated verification service, not a second unmanaged session system.
- Link identity providers only through a deliberate **logged-in, reauthenticated account-linking flow**. Handle collisions, revoked Google access, lost phone, phone recycling and device changes with support recovery procedures.
- Limit session duration for privileged users; revoke staff sessions when removed. Require step-up MFA for refunds, access to KYC, billing configuration and admin roles.
- Roles are **server-enforced**: `consumer`, `merchant_staff`, `merchant_manager`, `merchant_owner`, `support`, `admin`. Staff membership is **scoped to merchant/branch**, not globally granted.
- Secure sessions against CSRF/XSS: HttpOnly + Secure + SameSite cookies where applicable, CSRF protection on cookie-backed state-changing routes, strict CSP, short-lived signed codes, no secrets in client bundles.
- Google-only sign-in is **not** an anti-fraud system. Use account age, rate limits, redemption frequency, offer caps, device/network risk signals where proportionate and lawful; never rely on invasive fingerprinting without consent and review.

### Authorization examples

- Shopper may view only their own groups, group seats, and entitlement status; other members see only display name/initials unless opt-in.
- Merchant staff may scan only at assigned **branch**, for an approved active deal.
- Merchant owner may view verified redemptions and their own invoices, but not users' raw OTP codes or another merchant's data.
- Support may access minimal account data; admin KYC access uses justification logging and restricted permissions.

---

## 6. PostgreSQL data model

Use UUIDv7/ULID or UUID primary keys, `timestamptz` in UTC, `created_at`, `updated_at`, and explicit soft-deletion/retention policy. Group joining and redemption demand **database constraints**, not application counters alone.

| Table | Essential fields and constraints |
|---|---|
| `users` | `id PK`, `auth_user_id UNIQUE`, `display_name`, `locale`, `status`, `created_at` |
| `user_phones` | `id`, `user_id`, `phone_e164 UNIQUE WHERE verified_at IS NOT NULL` (subject to verified reassignment policy), `verified_at`, risk state |
| `merchants` | `id`, legal name, display name, registered address, PAN/VAT reference, verification status, agreement version, grievance contact, `status` |
| `merchant_documents` | `merchant_id`, document kind, encrypted private object key, reviewer, expiration; *never public URL* |
| `branches` | `id`, `merchant_id`, address, coordinates, timezone (`Asia/Kathmandu`), open hours, phone, `status` |
| `merchant_members` | `merchant_id`, `user_id`, `role`, branch scope; compound unique membership |
| `deals` | `id`, `merchant_id`, `branch_id`, category, slug, status, `current_version_id` |
| `deal_versions` | immutable `id`, `deal_id`, `party_size_required`, `base_price_paisa`, `group_price_paisa`, contents JSON, terms, rules, taxes disclosure, published_at |
| `booking_slots` | `id`, `branch_id`, `deal_id`, `start_at`, `end_at`, `capacity_groups`, `reserved_groups`, `confirmed_groups`, status; nonnegative capacity checks |
| `groups` | `id`, `deal_version_id`, `slot_id`, `organizer_id`, invitation token hash, `status`, `join_expires_at`, `confirmed_at`, version counter |
| `group_members` | `group_id`, `user_id`, `joined_at`, `status`; **UNIQUE(group_id, user_id)**; optionally one active seat/user/slot policy |
| `invitations` | id, group_id, referral source and optional referrer ID; token hash / expiry / rate limits, **no contact list scraping** |
| `vouchers` | `id`, `group_id UNIQUE`, `branch_id`, `status`, code hash / generation nonce, `valid_from`, `expires_at`, `redeemed_at` |
| `voucher_claims` | `id`, `voucher_id`, branch/staff user, `claimed_at`, `expires_at`, `status`; database-enforced **at most one active claim per voucher** |
| `redemptions` | `id`, `voucher_id UNIQUE`, `claim_id UNIQUE`, staff user, branch, price snapshot, attestation, redeemed timestamp, immutable audit reference |
| `merchant_payment_attestations` | merchant report of paid amount/method/time; `evidence_source=MERCHANT_REPORTED`; not independently verified settlement |
| `merchant_plans` | tier, price, billing period, limits, current subscription state |
| `billing_invoices` | `id`, merchant_id, amount_paisa, tax_paisa, invoice_number UNIQUE, status, due_at, invoice snapshot |
| `billing_payments` | `id`, invoice_id, provider, provider_reference UNIQUE, initiated/complete/failed/refunded, amount_paisa, idempotency key |
| `webhook_events` | provider, provider_event_id UNIQUE (when supplied), payload hash, processed_at, outcome; sanitized metadata |
| `complaints` | reporter, merchant/deal/group/redemption refs, reason, status, timestamps, assignment, outcome |
| `audit_logs` | append-only actor, operation, target, authorized context, time, IP coarse data, correlation ID; restricted reads |
| `outbox_events` | `id`, aggregate, type, JSON payload, occurred_at, dispatch status, retries |
| `idempotency_keys` | `actor_id`, route, key, request hash, response snapshot, expiration; unique per actor+route+key |

**Indexing:** `(deal_id, start_at)` for slots, `(status, join_expires_at)` for expirations, `(merchant_id, created_at)` for owner reports, `(group_id, user_id)` for joins, `(voucher_id)` for redemptions, and `(provider, provider_reference)` for billing. Search indexes may use PostgreSQL trigram/full-text initially; add a dedicated search service only when needed.

**Privacy note:** Avoid DOB, citizenship scans, exact live location or contact-book collection for consumers. Merchant verification requires separate privacy and access practices.

### Critical transaction: join group

```sql
-- Illustrative transaction logic; adapt table names and statuses to migrations.
BEGIN;
SELECT id, status, join_expires_at, deal_version_id
  FROM groups WHERE id = $1 FOR UPDATE;
-- Server checks ACTIVE status, clock, caller's verified phone,
-- restrictions, eligible slot, and current joined count.
INSERT INTO group_members (group_id, user_id, status, joined_at)
VALUES ($1, $2, 'JOINED', now())
ON CONFLICT (group_id, user_id) DO NOTHING;
-- Count active seats under the group lock.
-- If count == party_size_required, update group to FILLED and
-- insert a group_filled outbox event in the SAME transaction.
COMMIT;
```

**Production implementation:** Return meaningful responses for repeated joins; enforce one active user-seat per slot if required; ensure `join_expires_at` is not stale; make `FILLED` terminal for membership changes except explicit cancellation policy; test concurrency with many simultaneous requests. A worker must **never** be the sole arbiter of correctness; DB holds the truth.

### Critical transactions: claim then finalize redemption

```sql
-- FIRST: under voucher row lock, validate signed rotating code,
-- branch/staff authorization, group/slot eligibility and deadline;
-- expire any prior stale claim; then insert exactly one live claim.
-- A DB invariant or lock-serialized transaction prevents competing claims.
BEGIN;
SELECT id, status, branch_id, expires_at
FROM vouchers WHERE id = $1 FOR UPDATE;
-- Reject consumed/cancelled/expired voucher and wrong branch.
INSERT INTO voucher_claims (id, voucher_id, staff_user_id, branch_id,
                           claimed_at, expires_at, status)
VALUES ($2, $1, $3, $4, now(), now() + interval '90 minutes', 'ACTIVE');
COMMIT;

-- AFTER MERCHANT COLLECTS PAYMENT / CONFIRMS FULFILLMENT:
BEGIN;
SELECT * FROM vouchers WHERE id = $1 FOR UPDATE;
-- Verify a CURRENT active claim $2 bound to same voucher and branch,
-- and staff authorization again; obtain merchant's attestation.
UPDATE vouchers SET status = 'REDEEMED', redeemed_at = now()
WHERE id = $1 AND status = 'ISSUED' AND expires_at > now()
RETURNING id;
-- Exactly one row must be updated; append unique redemption record.
INSERT INTO redemptions (id, voucher_id, claim_id, staff_user_id,
                         branch_id, redeemed_at)
VALUES ($5, $1, $2, $3, $4, now());
UPDATE voucher_claims SET status = 'CONSUMED' WHERE id = $2;
INSERT INTO outbox_events (...) VALUES (...);
COMMIT;
```

**Pseudocode, not executable migrations:** The actual claim creation must enforce uniqueness for live claims in a DB-safe way; expired claims must be transitioned to `EXPIRED` before new claims are created under the voucher lock. Voucher expiry and visit-claim expiry should be modeled separately so a legitimately claimed, in-progress visit can finish according to prepublished terms. A failed payment releases the claim without redeeming. Unique indexes and locking must make double redemption impossible under concurrent scans.

---

## 7. State machines

### Group lifecycle

```mermaid
stateDiagram-v2
    [*] --> FORMING: Create group
    FORMING --> FILLED: Required unique members join
    FORMING --> EXPIRED: Formation TTL elapsed
    FORMING --> CANCELLED: Organizer / system cancellation
    FILLED --> CONFIRMED: Merchant confirms capacity
    FILLED --> REJECTED: Merchant declines / confirmation timeout
    CONFIRMED --> VISIT_CLAIMED: Authorized staff claims visit
    VISIT_CLAIMED --> CONFIRMED: Claim cancelled / expires
    VISIT_CLAIMED --> REDEEMED: Staff finalizes after direct merchant payment
    CONFIRMED --> NO_SHOW: Visit window ends without redemption
    CONFIRMED --> CANCELLED: Exceptional merchant/system action
    REDEEMED --> [*]
    NO_SHOW --> [*]
    EXPIRED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

Statuses are for the whole group; member exit/cancel restrictions depend on group state. Merchant delivery and payment attestation are **additional tracked facts**, not synonyms for redemption.

### B2B invoice payment lifecycle

`DRAFT → ISSUED → PAYMENT_PENDING → PAID` or `PAYMENT_FAILED/EXPIRED`; `PAID → REFUND_PENDING → PARTIAL/FULL_REFUND` if merchant subscription refund is applicable. Avoid rolling `PAID` back to `PENDING` when webhooks arrive out of order. Keep raw gateway statuses in separate immutable records.

---

## 8. Payments in Nepal: exact V1 and later phases

### 8.1 Phase A — customer pays merchant **directly** (launch)

```
Customer + group voucher
          |
          v
Merchant validates and claims voucher; applies agreed price
          |
          v
Customer pays merchant's OWN cash register / bank QR / wallet / card setup
          |
          v
Merchant finalizes voucher, issues required receipt/invoice, handles refunds
          |
          v
GroupUnlock records merchant-attested redemption/fulfillment
```

- The merchant is **seller of record** for the food/activity, collects money and issues the customer receipt. GroupUnlock is the intermediary/marketing and booking technology provider, subject to its own applicable legal duties.
- Existing [Fonepay merchant QR](https://fonepay.com/business/merchant-enrollment) supports customer-to-merchant QR payments. Static QR may settle to merchant but **does not let GroupUnlock independently verify which voucher generated which payment**.
- Staff must verify their bank/merchant notification or POS status before claiming the customer paid. Do **not** accept a customer screenshot as conclusive proof.
- GroupUnlock **must not** ask merchants to send their personal wallet credentials, intercept QR payments, scrape bank SMS, or request customer eSewa MPIN/PIN/OTP.
- A fixed group voucher is **not a prepaid voucher**. If fewer members arrive, follow displayed merchant policy; do not imply every unlocked voucher guarantees the full discount unconditionally.
- If the merchant fails to honor a legitimate voucher, provide in-app complaint handling and track repeat offenders. Consumer legal remedies cannot be waived by platform terms.

**Commercial consequence:** The platform cannot calculate actual payment volume from voucher scans alone. Dashboard labels must use terms such as **“merchant-confirmed redemptions”**, **“estimated basket value”**, or **“merchant-reported bill amount”** and never unqualified “verified sales.”

### 8.2 Phase B — merchant pays GroupUnlock (production payment integration)

GroupUnlock may bill registered merchant businesses for campaign management, subscription access or verified-redemption services under a signed agreement.

- **Preferred starting gateway:** **Khalti Payment Gateway (KPG) Web Checkout** for GroupUnlock's **own** invoices. A merchant account and KYC are required to operate normally. KPG documents indicate redirect checkout with `pidx`, `payment_url` and mandatory server-side **lookup** after callback; amounts are expressed in **paisa** in the API examples. Read provider documentation at implementation time.
- **Alternative:** **eSewa ePay V2**, which uses HMAC/SHA256 signed fields and server-side transaction status verification. Its merchant account receives the funds; do not assume it supports merchant-by-merchant split settlement.
- **Fonepay Checkout:** investigate directly with provider as another option. A QR-network enrollment does not by itself guarantee a public merchant API, delegated marketplace operations or access to other merchants' transactions.
- Never treat redirect `?status=Completed` or a screenshot as proof. Use authenticated server-to-provider lookup/status verification, compare invoice identity and exact amount, commit a single `PAID` transition idempotently, and reconcile provider settlements periodically.
- Credentials/secrets are server-only, encrypted at rest in secrets manager, and separately provisioned for testing and production.
- Refund GroupUnlock subscription fees according to the approved merchant subscription contract through supported provider/bank procedures; record refund states and issue credit notes where required.

**KPG billing flow:**

```mermaid
sequenceDiagram
    participant MER as Merchant owner
    participant API as GroupUnlock server
    participant DB as Billing DB
    participant K as Khalti

    MER->>API: Pay invoice (idempotency key)
    API->>DB: Load issued invoice, check amount, create pending attempt
    API->>K: Initiate checkout (server secret)
    K-->>API: pidx + payment_url
    API-->>MER: Redirect to hosted payment page
    MER->>K: Complete payment
    K-->>MER: Browser return/callback
    MER->>API: Open payment status page
    API->>K: Server-side lookup using pidx
    K-->>API: Authoritative gateway status + amount
    API->>DB: Atomic deduped payment confirmation
    API-->>MER: Invoice paid or still pending
```

**Payment invariant:** `invoice.status = PAID` only if verified provider status is final-success, amount matches, currency matches, merchant account and reference match, and the settlement attempt has not been consumed for another invoice. Unknown/timeout states remain pending for reconciliation — do not initiate duplicate debits automatically.

### 8.3 Phase C — integrated buyer checkout (do **not** launch without approval)

Only consider after evidence of product-market fit and advice from a Nepal-qualified lawyer/payment partner:

- Option 1: Each merchant integrates **their own** approved PSP account directly and sends GroupUnlock a signed order outcome via a formally permitted integration.
- Option 2: A **licensed PSP/bank-approved marketplace settlement** arrangement with merchant-of-record, split/settlement terms, KYC, refunds, taxes, disputes and contractual responsibilities explicitly supported.
- Do **not** copy a payment gateway secret for each merchant into the GroupUnlock dashboard or assume a single GroupUnlock KPG/eSewa integration can legally collect money “for” other merchants.
- If any prepaid group-purchase or wallet funds become a requirement, design cancellation, failed group refund, settlement and safeguarding controls **before** accepting the first rupee.

### Provider references

- [Khalti KPG docs](https://docs.khalti.com/) and [KPG getting started](https://docs.khalti.com/getting-started/)
- [Khalti merchant registration and document FAQ](https://khalti.com/payment-gateway/)
- [eSewa ePay V2 and verification](https://developer.esewa.com.np/pages/Epay-V2)
- [Fonepay business / static and dynamic QR](https://fonepay.com/business) and [Fonepay Business app](https://fonepay.com/business/app)

**Provider configurations, fees, API fields, settlement times and approval rules can change. Re-verify with the PSP before go-live.**

---

## 9. Legal, business and tax checklist — Nepal

> This is a **launch research checklist**, not a legal opinion. Work with a Nepal-qualified lawyer and accountant. The product should not accept real merchant invoices or promote live voucher contracts until relevant registration/contract obligations are confirmed.

1. **Incorporate/register the business** in an appropriate Nepal structure, obtain Business PAN, establish a company bank account, and determine VAT applicability with an accountant. [IRD taxpayer registration guidance](https://ird.gov.np/content/13668/taxpayer-service-and-registration/).
2. Evaluate the **Electronic Commerce (E-Commerce) Act, 2081 (2025)** and related rules/Department guidance. A transaction/booking/offer intermediary must **not assume it is exempt** merely because the end buyer pays the seller directly. Confirm listing/registration on the relevant government portal, disclosures and grievance handling. [Nepal Law Commission official act](https://lawcommission.gov.np/content/13517/electricity-trade--e-workers--act--2081/); [sourced legal overview](https://policynepal.org/laws/act-2081-electronic-business-e-commerce/).
3. Execute **written/electronic merchant agreements** specifying business identity, genuine reference pricing, stock/slot quotas, customer-facing terms, cancellation/no-show policy, tax/invoices, customer rights, complaint response, staff redemption, billing and data responsibilities. Have merchant-authorized signatories approve.
4. Publish **Terms of Service**, **Privacy Policy**, **Merchant Terms**, **Offer Terms**, **Cancellation/No-show**, **Complaints/Disputes**, **Advertising/Sponsored Listings**, **Data Retention and Deletion**. Clearly state what GroupUnlock sells versus what the venue sells.
5. Review Nepal's [Privacy Act, 2075](https://lawcommission.gov.np/content/12261/the-privacy-act-2075/) and applicable security/consumer obligations. Obtain appropriate consent, limit purpose, encrypt merchant KYC, enable access/correction/deletion requests subject to lawful retention requirements, and define processor responsibilities with vendors.
6. Review the Consumer Protection Act and e-commerce consumer return/refund obligations with counsel. A “final sale/no refunds” blanket disclaimer must never override mandatory law or misrepresented offers.
7. Show **legal operator name, physical address, PAN/VAT as applicable, support contact, complaints officer, business registration/online listing references as required**, merchant identity, total price and restrictions. Maintain complaint handling and records under applicable legal periods.
8. Classify subscriptions and campaign services for **tax invoice/VAT/withholding** correctly. Do not hardcode a tax rate or registration threshold based on old blog posts. Ask accountant to confirm 2026 tax obligations.
9. Confirm special permits/age restrictions for promoted activities, e.g. alcohol, gambling, controlled goods, medical services. **Exclude regulated/high-risk sectors** from first launch.
10. Check photo/music/menu rights, promotional consent, truthful reviews and misleading-discount rules. Do not publish invented ratings or reference prices.
11. Create breach response, complaints escalation, law-enforcement requests, record retention and audit plans before launch.
12. If adding referrals with cash incentives later, review advertising, tax, fraud and applicable reward/program restrictions before implementing withdrawals.

**Practical legal checkpoint:** Get a lawyer's written view on (a) intermediary listing/compliance, (b) voucher/booking contract status, (c) platform versus merchant duties, and (d) any payment/escrow implications **before live pilot**.

---

## 10. REST API contract (versioned)

Base: `/api/v1`; JSON and `application/problem+json` for errors. Schema-validate all inputs (`zod`). APIs use server-validated sessions, permissions, CSRF protection where relevant, `Idempotency-Key` for mutations, paginated collections, request IDs, anti-replay protections and audit records.

| Method | Route | Actor / purpose |
|---|---|---|
| `GET` | `/deals?area=&category=&date=` | Public discover; filter approved active offers |
| `GET` | `/deals/:slug` | Public detail, terms, seller and location |
| `GET` | `/deals/:id/slots` | Public eligible inventory, no sensitive counters |
| `GET` | `/auth/me` | Current user, verified phone flag, roles |
| `POST` | `/profile/phone/send` | Authenticated; controlled phone challenge |
| `POST` | `/profile/phone/verify` | Authenticated; verify one-time challenge |
| `POST` | `/groups` | Verified consumer; start group; slot held transactionally |
| `GET` | `/groups/:id` | Member/organizer with privacy-safe view |
| `POST` | `/groups/:id/join` | Verified consumer, idempotent atomic join |
| `POST` | `/groups/:id/leave` | Verified consumer, state-restricted cancellation |
| `POST` | `/groups/:id/cancel` | Organizer/admin, policy-enforced |
| `POST` | `/merchants/applications` | Merchant owner, upload docs using signed upload URLs |
| `POST` | `/merchants/:id/deals` | Approved merchant manager, draft only |
| `PUT` | `/merchants/:id/deals/:id` | New immutable deal version for meaningful changes |
| `POST` | `/merchant/groups/:id/confirm` | Authorized branch staff, confirm filled group |
| `POST` | `/merchant/vouchers/validate` | Authorized branch staff, validate token, no mutation |
| `POST` | `/merchant/vouchers/claim` | Authorized branch staff, temporary visit claim with TTL |
| `POST` | `/merchant/vouchers/redeem` | Authorized branch staff, atomic one-use redemption using valid claim |
| `POST` | `/merchant/vouchers/release` | Authorized branch staff, release claim if visit/payment abandoned |
| `POST` | `/merchant/redemptions/:id/attest` | Authorized merchant, payment/fulfillment statement |
| `GET` | `/merchant/metrics` | Merchant-scoped honest metrics |
| `GET` | `/merchant/invoices` | Owner/finance roles only |
| `POST` | `/merchant/invoices/:id/checkout` | Invoice payment initiation (GroupUnlock B2B only) |
| `GET` | `/merchant/invoices/:id/payment-status` | Server verified with PSP if needed |
| `POST` | `/billing/khalti/callback` | Input treated as untrusted; verify via lookup |
| `POST` | `/support/complaints` | Consumer/merchant complaint with attachments |
| `POST` | `/admin/merchants/:id/approve` | Admin, reason + audit |
| `POST` | `/admin/deals/:id/moderate` | Admin, logged status change |

**Example: join**

```http
POST /api/v1/groups/01JEXAMPLEGROUP/join
Authorization: Bearer <server-verifiable-session-token>
Idempotency-Key: 7a0b63a1-uuid-like-value
Content-Type: application/json

{}
```

```json
{
  "groupId": "01JEXAMPLEGROUP",
  "status": "FORMING",
  "joinedSeats": 3,
  "requiredSeats": 4,
  "joinExpiresAt": "2026-10-27T09:15:00+05:45",
  "viewerIsMember": true
}
```

`409 SLOT_UNAVAILABLE`, `409 GROUP_CLOSED`, `403 PHONE_NOT_VERIFIED`, and `429 RATE_LIMITED` should be machine-readable, predictable errors. Never return payment/identity secrets or another member's personal details.

---

## 11. Frontend routes and UX

| Route | Purpose |
|---|---|
| `/` | Neighborhood-based curated deals, value proposition, search |
| `/deals` | Category, budget, date, location and group-size filtering |
| `/deals/[slug]` | SEO/open graph-rich offer, **exact group terms** |
| `/g/[token]` | Deep-linked private invite, group progress and join CTA |
| `/my-groups` | Current/past groups, expiry and status |
| `/voucher/[id]` | Consent-aware personal voucher display, rotating token |
| `/login`, `/auth/callback`, `/verify-phone` | OAuth/phone verification and recovery |
| `/merchant/apply` | Merchant interest and business verification |
| `/merchant` | Owner overview; switch branch; performance |
| `/merchant/deals`, `/merchant/calendar` | Deal setup and slot capacity |
| `/merchant/redeem` | Camera scanner and manual backup input |
| `/merchant/billing` | Subscription invoice/payment status |
| `/admin/*` | Separate protected moderation/verification |
| `/help`, `/terms`, `/privacy`, `/complaints` | Support, compliance and trust |

### UX expectations

- Mobile-first, minimal steps between shared link and booking. Show deal details without authentication.
- Default `en-NP`, add `ne-NP` copy for important checkout/terms/support; dates display in Asia/Kathmandu with clear timezone.
- Page budgets: fast LCP on mobile networks, lazy-load rich media, compress images, minimize third-party scripts.
- Share cards explain the offer, merchant, deal window and seats remaining without exposing private details.
- Accessibility: keyboard navigable, semantic buttons, screen-reader status updates, high contrast, forgiving OTP entry, reduced-motion support.
- Empty states: merchant declined, formation expired, group already full, slot unavailable, phone OTP delayed, restaurant closed, poor connectivity, canceled merchant.
- Notifications: transactional group updates are separate from **opt-in** promotional messages; opt-out is easy.
- Never show artificially ticking scarcity; all availability numbers must reflect confirmed database state.

---

## 12. Abuse prevention, security and privacy controls

**Priority threats:** fake joins, SIM farm accounts, OTP bombing, leaked invite links, voucher screenshots, double redemption, merchant collusion, fake regular prices, misleading sponsored placement, automated scraping, KYC leaks, admin takeover and false settlement reports.

| Threat | Minimum mitigation |
|---|---|
| OTP cost attack | Per-IP/account/phone limits, CAPTCHA, resend cooldown, max challenge attempts, provider budget alerts |
| Referral farming | Only count unique *verified* joins; no rewards for signups or self-referrals in V1 |
| Double spending | DB unique voucher redemption, row locks, idempotent endpoints, time-limited token |
| QR screenshot/replay | Short-lived signed/rotating code, bind merchant branch, online server validation |
| Merchant discount bait | Immutable displayed terms, verified reference price, admin review, complaints and suspensions |
| Fake fulfillment | Merchant staff identity and timestamp, separate payment claim, optional sampled evidence; dispute workflow |
| Credential/session theft | OAuth best practices, cookies, MFA privileged users, device/session revocation |
| IDOR / privilege escalation | Object-scoped role checks on every endpoint and integration tests |
| SQL/HTML injection | Parameterized SQL, allowlisted rich text, escaping, CSP, sanitization |
| Webhook forgery/replay | Verification with provider, unique attempts/events, signature validation when supported |
| Data breach | Encryption, least privilege, object-storage private ACL, database backups, rotation and incident response |
| Supply-chain attack | Lockfile, dependency scanning, provenance checks, pinned CI actions, secret scanning |

**Privacy and retention:** Create a documented retention matrix per data class and local legal requirements. Group links, user profiles, SMS logs, merchant KYC, audit records, payment records and complaints have different access/retention periods. Never store raw OTPs in logs or analytics; use server-side hashes with suitable expiry and rate limits for a custom OTP service.

**Operational security:** Backup and restore drills; production/staging separation; database migration review; encrypted offsite backups; admin break-glass accounts; webhook alerts; incident severity categories and on-call owner.

---

## 13. Reliability and concurrency requirements

### SLO targets (initial engineering goals, not guarantees)

- Public deal detail uptime: **99.9% monthly target** after pilot.
- API p95 read latency: **under ~500 ms** from Nepal under normal load (benchmark with Nepal carriers).
- Critical join/redeem endpoints: correctness and no double allocation matter more than raw latency.
- Group expiration delay: typically **under 60 seconds**; stale groups must still fail immediately on server-side expiration check.
- Backup: automated daily full backups plus PITR where affordable; test restores at least quarterly; define RPO/RTO after infrastructure choice.

### Worker / outbox model

- Write business transition and `outbox_events` in one PostgreSQL transaction.
- Dispatcher delivers events to job system with at-least-once semantics; consumers implement idempotency.
- Retry transient SMS/provider failures with exponential backoff and dead-letter alerts; do not resend indefinitely or past user consent/expiry.
- Scheduled expiration is idempotent and should not remove a legitimately confirmed group.
- Reconcile gateway invoices by server-side lookup and settlement reports, including missing callback, duplicate callback, timeout, partial refund and provider outage.

### Load tests

- 100 simultaneous joins attempting last group seat → **exactly one** succeeds for that seat.
- 20 simultaneous voucher scans → **exactly one** redemption record.
- 1,000+ visitors opening a popular share link → public reads served by caching; mutation routes rate-limited, uncached and consistent.
- Expiry worker and final join racing at the deadline → deterministic server-authoritative outcome.
- Merchant employee removed midway through scan → no subsequent access permitted.

---

## 14. Deployment, environments and CI/CD

### Repository layout (recommended)

```text
groupunlock/
├── apps/
│   ├── web/                  # Next.js web, public pages, API routes
│   └── worker/               # BullMQ consumers / expiry and billing jobs
├── packages/
│   ├── db/                   # Drizzle schema, migration scripts and queries
│   ├── domain/               # Business rules and state transitions
│   ├── contracts/            # Zod API schemas and typed clients
│   ├── auth/                 # Session, policies and merchant role helpers
│   ├── payments/             # Merchant invoice PSP adapters only
│   ├── notifications/        # SMS, email and permissioned messaging
│   ├── ui/                   # Reusable accessible components
│   └── config/               # Lint, TS, environment validation
├── infrastructure/           # Terraform or AWS CDK, network, DB, secrets
├── docs/
│   ├── adr/                  # Architecture decision records
│   ├── api/                  # OpenAPI schema
│   ├── legal/                # Approved contracts / policies (controlled)
│   ├── runbooks/             # Incident recovery, outage and rollback
│   └── research/             # Interviews, payment provider approvals
├── tests/
│   ├── e2e/
│   ├── load/
│   └── security/
├── .github/workflows/
├── .env.example
└── README.md
```

### Environments

- `local`: Docker Postgres/Redis, fake SMS, payment mock, seeded merchants.
- `staging`: separate DB/secrets/domains; gateway sandbox; test numbers; representative staff and journey.
- `production`: least-privilege accounts, monitoring, daily backups, protected deploys, no seeded user data, no sandbox secrets.

### CI/CD acceptance gates

`format → lint → TypeScript → unit tests → integration/Postgres tests → API contract tests → Playwright mobile E2E → security/dependency scans → build image → deploy staging → smoke test → approve prod → smoke + monitor`.

- Database migrations are backward compatible first; use expand/contract approach.
- Never auto-deploy destructive schema changes without backup and review.
- Separate worker rollout from web rollout if queue contracts change.
- Feature flags for SMS login, merchant billing, auto-confirmation and individual merchant listings.
- Use secret manager, not `.env` in git. Rotate provider and admin secrets after incidents.

### `.env.example` (placeholders only)

```dotenv
NODE_ENV=development
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://local_user:local_password@localhost:5432/groupunlock
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVER_SECRET_KEY=SERVER_ONLY_SECRET
SMS_PROVIDER=mock
SMS_PROVIDER_API_KEY=SERVER_ONLY_SECRET
SMS_SENDER_ID=GROUPUNLOCK
EMAIL_PROVIDER_API_KEY=SERVER_ONLY_SECRET
OBJECT_STORAGE_BUCKET=groupunlock-private-local
OBJECT_STORAGE_REGION=ap-south-1
OBJECT_STORAGE_ACCESS_KEY_ID=SERVER_ONLY_SECRET
OBJECT_STORAGE_SECRET_ACCESS_KEY=SERVER_ONLY_SECRET
BILLING_PROVIDER=mock
KHALTI_SECRET_KEY=SERVER_ONLY_SECRET
KHALTI_API_BASE_URL=https://dev.khalti.com
ESEWA_MERCHANT_PRODUCT_CODE=OPTIONAL_FUTURE
ESEWA_SECRET_KEY=OPTIONAL_FUTURE
OTEL_SERVICE_NAME=groupunlock-web
SENTRY_DSN=OPTIONAL
```

**Env contract:** `NEXT_PUBLIC_` variables are visible to users. Never expose a Supabase service-role/secret key, Khalti secret, merchant PSP credential, OTP provider key, or object-storage private key there. Keep `SUPABASE_SERVER_SECRET_KEY` only if a privileged server action genuinely needs it; use least privilege. Normalize different Supabase key conventions according to the installed SDK/version.

---

## 15. Monetization and unit economics

### Recommended initial business model

1. **Pilot:** First 10 merchants for 30 days with **no platform charge** in exchange for verified operational feedback and an agreed case study if they consent.
2. **Paid beta:** Flat per-branch merchant subscription, e.g. **NPR 1,500–3,000/month** as a *pricing experiment*, not an established market price.
3. **Optional later:** Fixed fee per **merchant-confirmed redemption** only after abuse/reconciliation safeguards. Do **not** call this a confirmed paid sale unless independently verified.
4. **Later:** Sponsored placements must be clearly labeled and must not mislead customers about deal quality.

### Illustrative monthly models (not forecasts)

| Paying branches | Price/branch/month | Gross monthly recurring revenue |
|---:|---:|---:|
| 10 | NPR 2,000 | NPR 20,000 |
| 50 | NPR 2,000 | NPR 100,000 |
| 150 | NPR 2,500 | NPR 375,000 |

Gross amounts **exclude** tax, gateway costs, discounts, merchant acquisition, account managers, SMS, hosting, support, bad debts and churn. If merchants won't renew after a measurable campaign, the business has not found product-market fit.

### Merchant acquisition thesis and validation

- Recruit 10 independent venues within one compact geography; get signed offers and a staff redemption walkthrough before launch.
- Give them an off-peak package with explicit maximum daily redemption budget and no hidden discount funding.
- Measure **incremental** footfall, not just redemption counts; ask what traffic the venue would have gotten without the promotion.
- Test fixed subscription against a small per-redemption fee, recording merchant preference and objections.
- Churn reasons to log: deal unprofitable, excessive no-shows, staff forgot voucher, low-quality visits, confusing dashboards, invoice friction, poor customer retention.

### Customer acquisition and viral loop

`Public deal → Start group → Share to 3 friends → Friends join → Group confirmed → Visit → Review/share savings → Repeat`.

- Track invite open → signup → phone verify → join → confirmed → actual redemption, not vanity shares.
- Let users share directly to WhatsApp, Messenger, Viber and copied URLs; **do not scrape friends/contact books** or automate spam.
- Avoid paying cash for raw invites. Referral rewards, if added, should apply only to fraud-checked verified value and be legally reviewed.
- Influencers and merchant Instagram pages can seed supply, but should not be counted as organic virality.

**North star (V1):** `Completed qualifying group visits per active merchant per week`, paired with merchant satisfaction and a truthful cancellation/no-show rate. Supporting KPI: user repeat-visit rate, share-to-join conversion, time-to-fill, merchant-paid conversion and renewal.

---

## 16. 12-week build-and-validate roadmap

| Phase | Target | Deliverables / exit criteria |
|---|---|---|
| **W1–W2** — discovery, compliance | Validate buyer/seller pain | 30 consumer interviews, 20 merchant interviews, 10 signed pilot intentions; lawyer/accountant feedback on booking and merchant agreements |
| **W3–W4** — foundations | Working vertical slice | Repo, CI/CD, Postgres/Drizzle, Google OAuth, phone verification with NTC/Ncell tests, RBAC, merchant draft deals, landing and invite links |
| **W5–W6** — group core | Correctness-first beta | Slot capacity, atomic joins, expiry, status lifecycle, merchant confirmation, group view, one-time voucher, 100-way concurrency tests |
| **W7–W8** — operations | Staff can fulfill an offer | Merchant scanner, admin approval, complaints, audit logs, monitoring, private KYC uploads, merchant staff training |
| **W9–W10** — controlled pilot | Real redemption data | 5–10 venues, 50–100 authentic groups attempted, fulfillment/no-show measurement, refund/dispute responsibilities tested, manual merchant reconciliations |
| **W11–W12** — paid readiness | Prove demand or revise | Merchant invoice module with PSP sandbox + production onboarding, signed legal policies, backup drill, security review, 2–3 merchants willing to pay/renew |

The roadmap is a **planning hypothesis**, not a promise about execution time; legal/PSP approvals and market feedback may take longer. Do **not** turn on paid billing just to hit the schedule.

### Launch gate (all must be true)

- [ ] Legal entity, PAN, business account and required intermediary/e-commerce registrations reviewed and complete.
- [ ] Privacy, merchant/customer terms, disclosures, no-show and complaints procedures lawyer-reviewed.
- [ ] **10 properly verified merchants** and staff trained on real redemption and receipts.
- [ ] Every live offer has written merchant authorization and budget/limit, real reference price and full price disclosures.
- [ ] Google auth, verified phone, staff authorization and lost-device revocation have been tested.
- [ ] Joining/slot locks/redemptions survive concurrency tests with no double-booking/double-spend.
- [ ] Expiry workers, queue retries, error alerts, restore drill and manual outage plan tested.
- [ ] Merchant cash/QR payment happens directly to merchant; GroupUnlock doesn't hold consumer funds.
- [ ] Own B2B invoice gateway KYC, status verification, duplicate-callback/refund tests are complete **before charging merchants**.
- [ ] Customer complaints can be filed, tracked and escalated; emergency merchant/deal disable switch works.
- [ ] Offline and no-show cases clearly explained to customer and staff.
- [ ] Mobile PWA and invite links tested on Android devices, slow mobile data and both major Nepal networks.

### Pilot stop / pivot criteria (pre-register before testing)

- If fewer than **20%** of authenticated group creators generate one additional verified join from a shared link, reassess sharing incentive/product flow.
- If less than **50%** of filled groups reach confirmed+redeemed status, investigate confirmation friction and no-shows before scaling.
- If venues cannot show a believable incremental economics case and at least **2–3 of 10** pilot merchants refuse any reasonable paid continuation, revise merchant value proposition.
- If customer support burden or merchant misrepresentation is consistently high, pause listings until fulfillment trust improves.

These percentages are **proposed decision thresholds**, not external benchmarks or predictions.

---

## 17. Testing matrix and definition of done

### Unit / property tests

- Discount arithmetic, NPR/paisa formatting, timezone +05:45 conversion, deal version immutability.
- State transition permission matrix; invitation entropy and expiry; price and slot eligibility; coupon generation.
- RBAC per endpoint across consumer/merchant/staff/admin identities; deny by default.

### Integration tests (real Postgres)

- Concurrent join, leave, deadline race and duplicate idempotency key.
- Merchant-confirmed slot and repeated approval; staff removed from a branch; no cross-merchant leakage.
- Voucher expired/canceled/already redeemed; concurrent claims; claim TTL, abandoned/failed payment, staff rotation, and concurrent redemption.
- KPG/eSewa **own billing**: sandbox success, failed, pending, timeout, forged redirect, mismatched amount, duplicate status and refund where supported.
- SMS provider outage and high resend volume without failing open.

### End-to-end tests (mobile viewport and actual devices)

- Guest opens invite → logs in → verifies phone → joins → threshold fills → confirms → merchant scans/claims → merchant collects direct payment → finalize redemption.
- Expiry, merchant rejection, no-show, branch change, lack of location permission and network outage.
- Accessible screen-reader invitation and merchant scanner fallback.
- Complaint flow, user access/deletion request and staff/merchant offboarding.

### Definition of done

A feature is production-ready only when it has business rules and failure states documented, authorization, typed contracts, DB constraints/migrations, automated tests, analytics/observability, alerts, support runbook, and customer-facing terms where necessary. A pleasant UI alone is **not** a launch criterion.

---

## 18. Open questions to resolve with real evidence

1. Do customers prefer **one bill for a group bundle** or independently redeemable friend passes? V1 assumes one bill; validate through interviews.
2. Can venues consistently honor a filled group without external POS/reservation integration? Set merchant acceptance service levels.
3. How many group offers can merchants profitably supply off-peak, and what is the actual contribution margin after discount?
4. Are customers willing to complete phone verification to join, and what is real SMS delivery / cost across NTC and Ncell?
5. Does the 30-minute fill window work, or is a few hours more realistic? A/B test only after trustworthy inventory exists.
6. What evidence do merchants accept for billable redemptions? Agree on definition before merchant fees.
7. What are actual Khalti/eSewa onboarding, fees and invoice payment reconciliation obligations for the registered GroupUnlock legal entity?
8. Does the e-commerce intermediary regime apply to this exact mixed marketing/booking/offer contract model? Secure a written legal opinion.
9. Are merchant staff willing to scan vouchers when busy? Test at real counters before building sophisticated analytics.
10. Is the offer compelling without discounts being loss-making? Favor genuinely off-peak, capacity-driven packages.

---

## 19. Research references and verified documentation

**Source access checked 27 October 2026.** Official product docs and Nepal laws are primary references; market examples are contextual, not endorsements. Provider approvals, price sheets and live carrier delivery were **not** independently tested here.

### Nepal law and registration

- [Nepal Law Commission — Electronic Commerce Act, 2081](https://lawcommission.gov.np/content/13517/electricity-trade--e-workers--act--2081/) — authoritative entry point for actual text.
- [Policy Nepal — 2026 sourced E-Commerce Act summary](https://policynepal.org/laws/act-2081-electronic-business-e-commerce/) — useful index to provisions and sources; secondary explanation.
- [Nepal Law Commission — Privacy Act, 2075](https://lawcommission.gov.np/content/12261/the-privacy-act-2075/).
- [Inland Revenue Department — taxpayer registration](https://ird.gov.np/content/13668/taxpayer-service-and-registration/).
- [Kathmandu Post — online seller registration obligations](https://kathmandupost.com/money/2025/07/20/unregistered-online-sellers-now-illegal-in-nepal-under-new-e-commerce-law) — secondary reporting.

### Payments

- [Khalti Payment Gateway documentation](https://docs.khalti.com/).
- [Khalti — merchant onboarding / web flow / lookup](https://docs.khalti.com/getting-started/).
- [Khalti merchant FAQ and documentation requirements](https://khalti.com/payment-gateway/).
- [eSewa ePay V2: HMAC and verification](https://developer.esewa.com.np/pages/Epay-V2).
- [Fonepay merchant enrollment](https://fonepay.com/business/merchant-enrollment).
- [Fonepay QR business overview](https://fonepay.com/business).
- [Fonepay Business App / payment verification features](https://fonepay.com/business/app).

### Auth / messaging

- [Supabase Auth: Google sign in](https://supabase.com/docs/guides/auth/social-login/auth-google).
- [Supabase Auth: phone OTP](https://supabase.com/docs/guides/auth/phone-login).
- [Supabase Auth: custom Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook).
- [Sparrow SMS API docs](https://docs.sparrowsms.com/) — **verify current API/contract; published documentation may be older**.

### Local competitor research

- [BiteOut official website](https://biteout.app/) — local restaurant offers, redemption experience.
- [Students Club Nepal](https://studentclubnepal.com/) — student offers, merchant partners and QR redemption.

---

## 20. Final recommended implementation order

**Build the simplest trustable transaction before advanced discovery:**

`Merchant approved → Deal with exact terms → Phone-verified group of friends → Atomic group fill → Merchant confirms slot → One-time online voucher → Direct merchant payment → Verifiable redemption record → Merchant renews subscription`.

**The experiment is successful only when merchants voluntarily pay because they got incremental, profitable group customers.** A high number of invites without completed group visits is not product-market fit.

> **Implementation caution:** This README is an engineering/product spec for future build work; it does not claim any account has been created, payment gateway connected, Nepal legal clearance obtained, credentials issued, or source code deployed.
