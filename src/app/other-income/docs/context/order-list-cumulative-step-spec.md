# ORDER Contract List — Cumulative Amount + Current Step (draft)

Status: **backend delivered 2026-07-03 — ready to implement frontend.** Same
pattern as `promo-audit-list-spec.md` — additional columns on an existing
list page (`order-contract-list-page`), not a new screen. Requirement:
purchasing wants to see **current cumulative order amount** and **current
bracket (step)** per contract directly in the list, without opening each
contract's detail page.

## 0. Backend delivered — blocking issue resolved

`GET /v2/order-contracts` now returns `cumulativeOrderAmount` and
`currentBracket` directly on each list row, plus `startDate`/`endDate`
overlap filters — closing blocking issue #2 in `blocking-issues.md` exactly
as asked (fields promoted from detail-only onto the list response, no N+1
needed). New response shape:

```json
{
  "id": 1,
  "compCode": "10001",
  "compName": "ACME Trading Co., Ltd.",
  "compType": "DN",
  "contractLabelId": 1,
  "contractLabelName": "DC Support",
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "supplierPairId": null,
  "createdAt": "2026-06-04T09:00:00",
  "cumulativeOrderAmount": 1250000.00,
  "calcType": "Step",
  "currentBracket": {
    "id": 3,
    "min": 1000000.00,
    "max": 2000000.00,
    "rate": 5.00
  }
}
```

Notes from the updated API doc:
- `cumulativeOrderAmount` = sum of `order_amount` across
  `AUTO`/`CN_CORRECTION`/`MANUAL_CORRECTION` entries to date — matches
  exactly what §4.2 below specified (system order amount, `LAG_CORRECTION`
  excluded).
- `currentBracket` is `null` when the contract has no spec/steps configured
  yet — matches §1's note that `Flat` gets an implicit single bracket
  (`min: 0, max: null`) rather than showing nothing.
- New query params: `startDate`/`endDate` (overlap filter, either bound
  optional), on top of existing `compCode`/`compType`. This overlap filter
  wasn't asked for in this spec but is useful — worth considering whether
  the list page should also expose a period filter now that the API
  supports it (see open item below).
- No more N+1 — §2's join problem below is now obsolete, kept for historical
  context only.

**Remaining work is frontend-only:**
1. Update `TOrderContractListItem` (`shared/types/other-income.type.ts`) to
   include `cumulativeOrderAmount: number`, `calcType: TCalcType`,
   `currentBracket: TOrderContractStep | null`.
2. Update `getOrderContracts()` params
   (`purchase/services/other-income-purchase-api.service.ts`) to accept
   `startDate`/`endDate`.
3. Render the two new columns per §3 below.
4. **New open question**: should `order-contract-list-page` also expose a
   date-range filter now that the API supports it — matching PROMO's
   audit-list date-range ask (`promo-audit-list-spec.md`)? Not originally
   requested for ORDER, but the API shape now makes it free. Confirm before
   adding — don't build speculatively.
5. Update `docs/api/order-contract-api.md` to reflect the new response
   shape and query params (currently still documents the old shape without
   `cumulativeOrderAmount`/`currentBracket`/date filters).

## 1. What "cumulative" and "current step" mean here

Confirmed from `docs/api/order-contract-api.md:379` and
`docs/context/settlement-reference.md` §2:

- **The cumulative total is not stored anywhere.** It's reconstructed by
  summing `order_amount` across all income-entries for a contract, from
  `startDate` to now (any entry type — `AUTO`, `CN_CORRECTION`,
  `LAG_CORRECTION` excluded per the report spec's note that lag corrections
  adjust the supplier side only, `MANUAL_CORRECTION`).
- **"Current step"** = whichever bracket (`steps[]` row, keyed by
  `min`/`max`/`rate`) the reconstructed cumulative total currently falls
  into. Only meaningful for `calcType = Step` or `Cumulative` contracts —
  `Flat` contracts have exactly one step, so showing a "current step" column
  for them is a no-op (always the same row) worth just rendering as
  "Flat"/"—" rather than a bracket range.
- This is the same derivation the backend already does for settlement/AUTO
  calculation (`GetPreviousCumulativeOrderAsync` in the settlement
  reference) — the list page needs to reconstruct the same number client-side
  for **display only**, not recompute the actual income (that stays
  backend-authoritative at settlement time).

## 2. Data sources to join — and a scale concern PROMO's spec didn't have

**(Obsolete as of §0 — kept for historical context on why the backend ask
was made.)**

| Source | Endpoint | Fields needed |
|---|---|---|
| Contract list | `getOrderContracts()` → `GET /v2/order-contracts` | `id`, `compCode`, `compName`, `compType`, `startDate`, `endDate` |
| Income entries (cumulative sum) | `GET /v2/income-entries?contractType=ORDER` | `contractId`, `orderAmount` (sum per contract, AUTO/CN_CORRECTION/MANUAL_CORRECTION only) |
| Steps/brackets | `GET /v2/order-contracts/{id}` (**single-contract only — no bulk endpoint**) | `steps[]` (`min`, `max`, `rate`), `spec.calcType` |

**The steps join is the problem.** Unlike PROMO's spec (3 endpoints, all
list/filter-shaped), `steps[]` and `calcType` only exist on the **per-contract
detail** response — there's no `GET /v2/order-contracts?includeSteps=true` or
similar. At ~100 contracts, showing "current step" on the list page as
specified would otherwise mean N detail requests, one per row.

**Decision (resolved 2026-07-03): backend API update required.** Add
`steps[]` and `calcType` (currently only on `GET /v2/order-contracts/{id}`)
to the list endpoint response, `GET /v2/order-contracts`. This is a
**blocking issue** — frontend work on this column should not start until the
list endpoint returns this data; do not build the N+1/lazy-load workaround as
a substitute. Same category as `report-page-spec.md` §3's compType/compName
ask — file both as backend follow-ups together since they're the same shape
of request (extend a list endpoint with fields currently only on detail).

## 3. Proposed columns (additions to `order-contract-list-page`)

| column | source | notes |
|---|---|---|
| Current cumulative order amount | summed `income-entries.orderAmount` | per contract, from `startDate` to now |
| Current step / bracket | derived: match cumulative against `steps[]` | render as e.g. "Step 2 (500,000–1,000,000, 3%)"; for `Flat` contracts render "Flat" instead of a bracket |

No new filters implied by this requirement (unlike PROMO's date-range ask) —
this is display-only enrichment of existing rows.

## 4. Decisions (resolved 2026-07-03)

1. **Current bracket display only** — show which step/bracket the contract
   is currently in (e.g. "Step 2 (500,000–1,000,000, 3%)"). No
   proximity-to-next-bracket indicator; keep this a direct display of the
   current bracket, not a progress feature.
2. **"Current cumulative" = system order amount** — i.e. the same
   `systemOrderAmount` concept from `settlement-reference.md` §2: summed
   `orderAmount` across `AUTO`/`CN_CORRECTION`/`MANUAL_CORRECTION` entries
   only (`LAG_CORRECTION` excluded, since it adjusts the supplier-side figure,
   not the system accrual — same exclusion rule as the report page's
   `netOrderAmount`). Confirmed contract-to-date (`startDate`-to-now), not
   scoped to the current settlement period — matches backend semantics, and
   is the same figure the report page already surfaces per contract+month,
   just summed to a running total here instead of shown per-month.
