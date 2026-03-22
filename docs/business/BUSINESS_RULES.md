# Gatherly — business rules (v1)

**Audience:** product, engineering, operations.  
**Consumer-facing copy** should stay simple; this document is the internal definition of truth.

**Alignment:** Booking and payment enums in [`packages/shared/src/constants.ts`](../../packages/shared/src/constants.ts); API behavior in [`packages/api/src/lib/vendorBookingStatus.ts`](../../packages/api/src/lib/vendorBookingStatus.ts), [`packages/api/src/lib/bookingPayment.ts`](../../packages/api/src/lib/bookingPayment.ts), [`packages/api/src/routes/bookings.ts`](../../packages/api/src/routes/bookings.ts), [`packages/api/src/routes/vendor.ts`](../../packages/api/src/routes/vendor.ts).

---

## 1. Principles

1. **Collection:** The consumer pays **Gatherly (the platform)**. Funds are recorded on the booking as `paymentStatus` (today: simulated/dummy card flow; production will use a real PSP).
2. **Payout:** Vendors are paid **by the platform** on a schedule and under conditions defined below. **Vendor bank details** are stored on the vendor record; **operational payout batches** (`PayoutBatch` / `PayoutLine`) record which bookings are included and when marked paid — bank transfers remain manual until PSP automation.
3. **Separation:** **Booking status** = fulfillment workflow. **Payment status** = money collected/refunded on that booking. Both must be read together for decisions.
4. **Honesty:** Where the product does not yet enforce a rule (refund API, consumer cancel, payout runs), this doc states **policy intent** and marks **implementation gap**.

---

## 2. Glossary

| Term | Meaning |
|------|---------|
| **Booking** | A consumer request for a vendor package tied to an **event**; has `bookingReference`, line items (`subtotal`, `serviceCharges`, `totalAmount`). |
| **Event** | Consumer’s occasion; can have **multiple bookings** (multiple vendors/packages). |
| **Collection** | Consumer → platform: marks booking `paymentStatus = paid` (after vendor confirmation and checkout rules). |
| **Refund** | Platform → consumer: reverses or reduces what was collected; recorded as `paymentStatus = refunded` (or partial — **not modeled yet**). |
| **Payout** | Platform → vendor: transfer of **net** earnings for a booking or period (**policy below; automation TBD**). |
| **Platform fee** | Portion of `serviceCharges` / commercial terms retained by Gatherly (exact split for payout is an **ops/finance decision**; amounts are stored per booking). |

---

## 3. Roles

| Role | Responsibilities |
|------|------------------|
| **Consumer** | Creates bookings, pays (when allowed), reviews after service. |
| **Vendor** | Accepts/declines pending requests, advances fulfillment statuses, may cancel per allowed transitions. |
| **Platform (Gatherly)** | Collects payment, defines refund/payout policy, operates admin/support (future: admin app). |
| **Admin / support** | Handles exceptions not in self-serve flows (disputes, manual refunds, payout batches until automated). |

---

## 4. Booking status (canonical meanings)

Values: `pending` → `confirmed` → `in_preparation` → `delivered` → `completed`, or **`cancelled`** at certain points.

| Status | Meaning |
|--------|---------|
| `pending` | Request sent; vendor has not accepted. **No payment** allowed yet for this event’s checkout rules. |
| `confirmed` | Vendor accepted. Consumer may pay (if all sibling bookings for the event allow checkout — see §7). |
| `in_preparation` | Vendor is preparing; **requires** `paymentStatus = paid`. |
| `delivered` | Service delivered at event. |
| `completed` | Booking closed (e.g. after handoff / final step). |
| `cancelled` | Booking will not be fulfilled under this record. Reason may be stored in `cancellationReason` (e.g. vendor decline). |

---

## 5. Payment status

Values: `unpaid` | `paid` | `refunded` (see [`PAYMENT_STATUS`](../../packages/shared/src/constants.ts)).

| Status | Meaning |
|--------|---------|
| `unpaid` | Not yet collected from consumer for this booking. |
| `paid` | Collected (dummy or real PSP). |
| `refunded` | Platform refund recorded; set by **admin** via `POST /api/admin/bookings/:id/refund` (dummy money rail; production will call PSP). See §9 and [`ADMIN.md`](./ADMIN.md). |

**Rule:** Initial payment is only allowed when `status === confirmed` and `paymentStatus !== paid` ([`assertBookingEligibleForInitialPayment`](../../packages/api/src/lib/bookingPayment.ts)).

---

## 6. Money flow (target operating model)

1. **Consumer checkout** updates booking to `paymentStatus = paid` and stores a **payment method label** (e.g. card brand + last4) on the booking.
2. **Gatherly** holds settlement responsibility (merchant of record vs agency model — **legal/finance to confirm**).
3. **Vendor payout:** Vendor earns **net** amount after platform fee and any adjustments. **Suggested policy (to be ratified):**
   - **Eligibility:** Vendor becomes eligible for payout **after** `completed` **or** a defined window after `delivered` (e.g. 24–72h dispute window), unless refunded.
   - **Frequency:** Weekly or monthly batch (**TBD**).
   - **Clawback:** If a **refund** is issued after payout was made, recover from **future payouts** or manual settlement (**TBD**).

Until payout tables exist, treat payout as **manual** with this document as the target policy.

---

## 7. Consumer rules

1. **Create booking:** One active (non-`cancelled`) booking per `(userId, eventId, vendorId, packageId)` ([409 if duplicate](../../packages/api/src/routes/bookings.ts)).
2. **Pay:** Only for `confirmed` + `unpaid` bookings.
3. **Event-level checkout gate:** Payment (single booking or `pay-event`) is blocked while **any** non-cancelled booking for that event is still `pending` ([`assertNoPendingBookingsForEvent`](../../packages/api/src/lib/bookingPayment.ts)). **Rule:** All vendors must accept (or decline) before the consumer can pay for confirmed bookings on that event.
4. **Review:** Allowed when `status` is `delivered` **or** `completed`, one review per booking ([`POST /api/bookings/:id/review`](../../packages/api/src/routes/bookings.ts)).

---

## 8. Vendor-driven status transitions (enforced in API)

Source: [`assertVendorBookingStatusTransition`](../../packages/api/src/lib/vendorBookingStatus.ts).

| Current status | Allowed next statuses |
|----------------|------------------------|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `in_preparation`, `cancelled` |
| `in_preparation` | `delivered` |
| `delivered` | `completed` |
| `completed` | *(none)* |
| `cancelled` | *(none)* |

**Additional enforced rule:** Transition to `in_preparation` **requires** `paymentStatus === paid`. If not paid, API returns 400: *"Customer must pay before you can start preparation."*

**Vendor cancel:** When moving to `cancelled`, API sets `cancellationReason` to **"Declined by vendor"** (covers decline from `pending` or cancellation from `confirmed`). **Gap:** If consumer was already `paid`, **automatic refund is not implemented** — treat as **support/admin** action + future `paymentStatus`/`refunded` handling.

---

## 9. Cancellation and refunds (policy matrix)

**Legend:** **I** = implemented in API/automation; **P** = policy intent; **G** = gap.

| # | Scenario | Booking outcome | Consumer money (policy) | Vendor payout (policy) | Notes |
|---|----------|-----------------|---------------------------|-------------------------|--------|
| 1 | Vendor declines (`pending` → `cancelled`) | `cancelled` | Nothing was collected. **No refund.** | None | **I** |
| 2 | Vendor cancels after confirm, consumer **not** paid | `cancelled` | Nothing collected. | None | **I** |
| 3 | Vendor cancels after confirm, consumer **paid** | `cancelled` | **Full refund** to consumer (platform). | Vendor receives **nothing** for this booking | **P** — **G:** no auto refund in API |
| 4 | Consumer requests cancel before pay | — | N/A | N/A | **G:** no consumer cancel endpoint in API **P:** allow cancel request or self-cancel `pending`/`confirmed`+unpaid — **TBD** |
| 5 | Consumer requests cancel after pay, before event | — | **Full or partial** refund per cutoff policy | Adjust net | **P** — **G:** implement cancel + refund |
| 6 | No-show / dispute after service | — | Case-by-case | Case-by-case | **P:** support-led |

**Refund implementation gap:** `paymentStatus = refunded` exists in types but **no route** sets it today. When built, align with matrix rows 3 and 5.

---

## 10. Notifications (behavior tied to rules)

On vendor status updates, consumers receive in-app notifications for: confirmed, declined (`cancelled`), in preparation, delivered, completed ([vendor route](../../packages/api/src/routes/vendor.ts)). Payment triggers **"Customer has paid"** to vendor ([bookings pay routes](../../packages/api/src/routes/bookings.ts)).

---

## 11. Spotlight (vendor marketing)

Vendor **Spotlight** purchases are **separate** from consumer bookings: simulated payment for featuring a package ([`PLAN_VENDOR_GAPS.md`](../PLAN_VENDOR_GAPS.md)). Do not mix payout rules for catering bookings with Spotlight billing.

---

## 12. Implementation summary

| Rule area | In code today |
|-----------|----------------|
| Booking statuses | Yes — Prisma + vendor transitions |
| Payment `paid` via dummy checkout | Yes — `PATCH .../pay`, `pay-event` |
| Payment `refunded` | Yes — admin `POST /api/admin/bookings/:id/refund` (audit + notifications); consumer/vendor UIs show refunded |
| Consumer-initiated cancellation | Yes — `PATCH /api/bookings/:id/cancel` when unpaid and `pending` or `confirmed` (see API) |
| Automatic refund on vendor cancel after pay | **No** — use admin refund after coordination |
| Payout ledger | Yes — `PayoutBatch` / `PayoutLine`, eligible query, mark-paid; vendor sees status on booking detail |
| Admin portal | Yes — `apps/admin` (`NEXT_PUBLIC_API_URL`), `/api/admin/*` (JWT role `admin`); runbook: [`ADMIN.md`](./ADMIN.md) |

---

## 13. Decisions to ratify (business/ops)

1. **Refund SLA** when vendor cancels after payment (how fast must platform refund consumer).
2. **Consumer cancellation** windows (how many days before event, fees).
3. **Payout schedule** and **minimum** balance.
4. **Platform fee** definition per booking (already stored as `serviceCharges`; confirm %/fixed in product terms).
5. **Chargebacks** (card network) — support process until automation.

---

## Document history

| Version | Change |
|---------|--------|
| v1 | Initial business rules: aligned with API + platform collection / vendor payout intent |
| v1.1 | Admin portal, refunds, payout ledger, consumer cancel — see §12 and [`ADMIN.md`](./ADMIN.md) |
