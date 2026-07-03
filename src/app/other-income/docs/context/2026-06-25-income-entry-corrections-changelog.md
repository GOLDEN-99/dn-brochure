# 2026-06-25 — Income entry corrections, CN redesign, settlement cumulative fix

## 1. Settlement cumulative bug (fixed)

**What:** `SettlementService.CreateAsync` computed `systemIncome`/`supplierIncome` via
`StepCalculator.Calculate(spec, steps, netOrder)` — using only the current period's
order amount, never combined with the contract's prior cumulative total.

**Why this was wrong:** for `Step`/`Cumulative` calc types, the bracket the order amount
falls into depends on the contract-to-date total, not the period slice alone. The old code
effectively restarted the bracket ladder at zero on every settlement after the first,
silently understating income for any contract with settlement history.

**Fix:** both `systemIncome` and `supplierIncome` are now computed as a bracket delta —
`Calculate(cumulativeAfter) - Calculate(cumulativeBefore)` — reusing the existing
`GetPreviousCumulativeOrderAsync` lookup. `Flat` calc type is unaffected (linear, so the
delta equals the direct calculation either way).

## 2. Monthly estimate now uses the same cumulative math

**What:** `IncomeEntryService.AutoCreateForOrderAsync` computed each month's estimate as
`Step(this month's order amount)` in isolation, with no cumulative lookup at all.

**Why:** this made the monthly *estimate* inconsistent with the *settlement* calculation
for Step/Cumulative contracts — the estimate could look very different from what
settlement would actually produce, confusing interim reporting.

**Fix:** added `IIncomeEntryRepository.GetCumulativeOrderAmountBeforeAsync` (sums
`order_amount` across every entry, any type, for months before the target). The monthly
estimate is now also a bracket delta over cumulative-before/after, matching settlement's
shape.

## 3. Income entries are no longer one-row-per-month — corrections added

**What changed:** `other_income_income_entries` previously held exactly one row per
(contract, month) — the auto-generated estimate, immutable after creation, with no way to
adjust it except deleting and re-running the same auto-create endpoint.

**Why:** real-world corrections happen for three distinct reasons, none of which the
single-row model could represent without mutating history (which the codebase's
append-only design forbids):
- a returned-product credit note (CN) arrives any time before settlement
- data arrives late and needs including in month `m` but excluding again from `m+1`
  once the system's own data catches up
- a manual fallback for cases the system can't auto-correct

**Fix:** added an `entry_type` column (`AUTO | CN_CORRECTION | LAG_CORRECTION |
MANUAL_CORRECTION`). Multiple rows can now exist for the same contract+month; the old
unique index was replaced with one filtered to `AUTO` only (still exactly one estimate
per month, but unlimited corrections alongside it). Corrections carry a *signed*
`order_amount`, so summing every entry for a month/contract naturally nets the correction
against the original estimate — no special-case subtraction needed anywhere downstream.

## 4. CN orders redesigned twice this session — ended up as just another correction

**First pass:** gave `other_income_cn_orders` a proper product-line model
(`good_code`/`amount` instead of a single `order_numb`/`order_amount`), since CN events
are returned-product credit notes, not order slices. Added `other_income_cn_order_items`
as a child table.

**Why that wasn't the end state:** `SettlementService` took two independent,
caller-supplied id lists — `IncomeEntryIds` and `CnOrderIds` — with nothing tying a CN
order to the correction entry it generated. A caller could pick one list without the
other, causing either double-counting (CN subtracted twice) or an orphaned correction
that would silently corrupt later cumulative math, with no validation catching the
mismatch.

**Final fix:** removed `other_income_cn_orders`/`other_income_cn_order_items` entirely.
A CN is now created directly as a `CN_CORRECTION` income entry (same mechanism as lag/manual
corrections) via `IncomeEntryService.CreateCnCorrectionAsync`. Product-line detail moved
to `other_income_cn_correction_items`, an audit-only table keyed by the entry itself —
never read by the income calculation, which relies solely on the entry's
`order_amount`/`amount`. `SettlementService` now only ever deals with `IncomeEntryIds`;
there is no second list to keep in sync, so the double-counting/orphaning bug is
structurally impossible rather than something to validate against.

## 5. Lag correction — dual-insert pattern, brought in line with CN's structure

**What:** added `IncomeEntryService.CreateLagCorrectionAsync` for the "supplier declared
extra amount before settlement" case: inserts a `+amount` entry in month `m` (counts
toward `m`'s settlement) and a mirrored `-amount` entry in month `m+1` (so it isn't
double-counted once the system's own data catches up). Both entries use the same
bracket-delta math as CN/settlement.

**Inconsistency caught and fixed:** the first version stored order numbers as a flat
comma-joined string in the entry's `note` column, while CN correction (built earlier the
same session) already used a structured per-line child table. Brought lag correction in
line: added `other_income_lag_correction_items` (`order_numb`, `amount` per line), same
shape as CN's items. The `-month+1` entry gets its own copy of the item lines (negated),
so each row's audit trail is self-contained.

## 6. Reporting view rewritten for the multi-row-per-month model

**What:** `vw_other_income_accrual_state` joined `other_income_income_entries` against
`other_income_cn_orders` and assumed exactly one entry row per contract+month, exposing a
single `settlement_id`/`state` per month.

**Why it had to change:** both assumptions broke — the CN table no longer exists, and
AUTO + correction rows for the same month can now be picked into *different* settlements
at different times, so no single `settlement_id`/`state` can represent a month anymore.

**Fix:** the view now sums every entry (any type) per contract+month into
`net_order_amount`/`estimate_income` only. Per-row open/picked status is available via
`GET /v2/income-entries` if needed; the view itself reports aggregates, not state.

## 7. Migration delivery — `DatabaseMigrator.cs` updated, not just the `.sql` spec file

**Why both:** per `V2/other-income-v2/migration-checklist.md`, the `.sql` files under
`migration/` are specification documents — they are **not** run automatically. The actual
live DB is only changed by `POST /test/migrate`, which executes the hardcoded step list in
`Service/DatabaseMigrator.cs`. All of today's schema changes (new columns, constraint,
index swap, two new item tables, the rewritten view) were added there as individually
named, error-tolerant steps, split per-statement since Dapper runs each step as a single
batch.

## New endpoints

- `POST /v2/income-entries/order/{contractId}/cn-correction` — record a CN (returned
  products), body: `{ contractId, month, items: [{goodCode, amount}], note }`.
- `GET /v2/income-entries/{id}/cn-items` — audit detail for a CN_CORRECTION entry.
- `POST /v2/income-entries/order/{contractId}/lag-correction` — record a supplier-declared
  late amount, body: `{ contractId, month, items: [{orderNumb, amount}] }`.
- `GET /v2/income-entries/{id}/lag-items` — audit detail for a LAG_CORRECTION entry.
- `POST /v2/income-entries/correction` — manual fallback correction (no item detail table).

## Removed

- `CnOrderController`, `CnOrderService`, `CnOrderRepository`, `CnOrder`/`CnOrderItem`
  entities, `V2/Contracts/CnOrder/*`.
- `CreateSettlementRequest.CnOrderIds`, `ISettlementRepository.StampCnOrdersAsync` /
  `UnstampCnOrdersAsync`.
- `AccrualStateResponse.EstimateOrderAmount` / `CnOrderAmount` / `SettlementId` / `State`
  (collapsed into `NetOrderAmount`/`EstimateIncome` only); the `state` query param on
  `GET /v2/report/accrual-state`.

## Not done / explicitly out of scope

- No automated test coverage was added for the new correction flows (`CnCorrectionAsync`,
  `LagCorrectionAsync`, the settlement cumulative fix) — none of this was exercised against
  a live DB. The existing `IncomeEntryServiceTests`/`IncomeEntryBranchTests` were only
  updated for the constructor signature change.
- No data migration plan for existing rows once `entry_type` is added (default `'AUTO'`
  covers all pre-existing rows correctly, so this is a non-issue, but no backfill/cutover
  plan exists for production data more broadly — see `decisions.md`).
- Several pre-existing schema-drift gaps from `migration-checklist.md` remain unaddressed
  (`other_income_branch_*`, `other_income_promo_contracts`, deferred FKs) — unrelated to
  this session's scope.
