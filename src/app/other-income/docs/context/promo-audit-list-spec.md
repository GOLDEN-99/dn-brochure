# PROMO Audit List — Screen Spec (draft)

Status: **backend delivered 2026-07-03 — ready to implement frontend.**
Companion to `user-workflow.md` § `purchasing workflow > audit > PROMO`.
This audit need is met by **extending the existing `promo-contract-list-page`**
(new columns + a date-range filter), not a new screen — "complete contract
documentation" was clarified to mean **has a posted settlement**.

## 0. Backend delivered — most of §2's join is now server-side

`GET /v2/promo-contracts` now returns `entriesAmountTotal` and
`settlementsSupplierIncomeTotal` directly on each list row, plus
`startDate`/`endDate` overlap filters (same shape as the ORDER list update —
see `order-list-cumulative-step-spec.md` §0). New response shape:

```json
{
  "id": 1,
  "compCode": "10001",
  "compName": "ACME Trading Co., Ltd.",
  "compType": "DN",
  "contractLabelId": 3,
  "contractLabelName": "Salesman Promotion",
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "createdAt": "2026-06-05T09:00:00",
  "entriesAmountTotal": 45000.00,
  "settlementsSupplierIncomeTotal": 42000.00
}
```

`entriesAmountTotal` = §2's `accrualAmount`. `settlementsSupplierIncomeTotal`
= §2's `settlementSupplierAmount` (already summed across all settlements,
matching decision §4.2 exactly — no client-side summing needed).

**Verified directly against the live API** (2026-07-03,
`https://api.otherincome.healthupgroup.com/v2/promo-contracts`): contract
`id:1` in the real response has `entriesAmountTotal: 0.0000` with no income
entries at all — confirming `0` is the actual "no data" sentinel (nulls are
coerced to `0`, not omitted or returned as `null`), not something a real
settlement could ambiguously produce. **This resolves the `hasSettlement`
concern raised earlier**: `settlementsSupplierIncomeTotal === 0` is a safe,
sufficient proxy for "no posted settlement" — no separate boolean/count
field needed from backend after all.

**Still needs a client-side join:**
- **`latestSettlementDate`** — not returned by this endpoint (confirmed
  against the live response, which only has the two total fields). If this
  column is still wanted, it needs `GET /v2/settlements?contractType=PROMO`
  joined client-side by `contractId` (same as originally scoped in §2),
  purely for the date — the amount fields no longer need this join.

**Remaining work, mostly frontend:**
1. Update `TPromoContractListItem` (`shared/types/other-income.type.ts`) to
   include `entriesAmountTotal: number`, `settlementsSupplierIncomeTotal: number`.
2. Update `getPromoContracts()` params
   (`purchase/services/other-income-purchase-api.service.ts`) to accept
   `startDate`/`endDate`.
3. Render has-settlement status badge as `settlementsSupplierIncomeTotal > 0`
   — confirmed safe, no further backend ask needed.
4. Decide whether `latestSettlementDate` is worth keeping — if yes, it's the
   only field still requiring the original client-side settlements join.
5. Render columns per §3 (superseded by this section for the amount
   columns — no longer client-side summed, just mapped from the response).
6. Update `docs/api/promo-contract-api.md` (confirmed exists) to reflect
   the new shape, same as flagged for `order-contract-api.md`.

## 1. Requirement recap

> promo base contract lives short a 1-3 month long. purchasing require a way
> to list all PROMO contract with supplier name(compName) in a given period
> to see weather they have complete contract documentation.

Clarified in conversation (2026-07-03):

- **"Complete documentation" = has a posted settlement.** Not a manual
  judgment call, not a document-upload/attachment field (confirmed: no such
  field exists anywhere in `other-income.type.ts` or the API docs —
  "document" elsewhere in this system always means external supplier
  paperwork, never something tracked in-app).
- **Period filter = date range the user picks to search**, not tied to a
  fixed month/quarter grain.
- **Detail per contract**: needs both the **accrual amount** (system side)
  and **settlement `supplierOrderAmount`** (supplier-confirmed side) shown
  together — the audit is implicitly a system-vs-supplier comparison, not
  just a completeness checkbox.
- **Scale**: ~100 records. Client-side join across 2-3 endpoints is fine —
  no pagination/API-side filtering needed for this volume.
- **Screen scope**: build PROMO-only for now. If ORDER/BRANCH later need the
  same audit view, refactor into something shared at that point — don't
  design the abstraction preemptively.

## 2. Data sources to join (client-side) — mostly superseded by §0

**Amount fields below are now server-side (§0) — this section is kept for
the still-needed `latestSettlementDate` join and historical context.**

| Source | Endpoint | Fields needed |
|---|---|---|
| Contract list | `getPromoContracts()` → `GET /v2/promo-contracts` | `id`, `compCode`, `compName`, `compType`, `startDate`, `endDate`, `contractLabelName` |
| Income entries (accrual amount) | `GET /v2/income-entries?contractType=PROMO` | `contractId`, `month`, `amount` (sum per contract for the accrual-side figure) |
| Settlements (documentation signal + supplier amount) | `GET /v2/settlements?contractType=PROMO` | `contractId`, `supplierIncome`, `createdAt` |

Join key throughout: `contractId` = promo contract's `id`.

**Per-contract derived fields:**

- `hasSettlement: boolean` — `true` if any settlement row exists for this
  `contractId`. This is the "complete documentation" signal.
- `accrualAmount: number` — sum of `amount` across income-entries for this
  `contractId` (mirrors `estimateIncome` semantics from the report page,
  scoped to PROMO which has no `orderAmount`/net-order concept).
- `settlementSupplierAmount: number | null` — **`supplierIncome`**, summed
  across all settlement rows for this `contractId` (`supplierOrderAmount` is
  not used for PROMO — confirmed, PROMO has no order-amount concept). `null`
  if `hasSettlement` is false.
- `latestSettlementDate: string | null` — max `createdAt` across this
  contract's settlement rows, if more than one exists.

A PROMO contract can have more than one settlement row: **sum
`supplierIncome` across all of them**; for the settlement date column, use
the **max** (most recent) `createdAt`.

## 3. Proposed screen shape

**Route**: no new route. This is **additional columns + a date-range filter
on the existing `promo-contract-list-page`**, not a separate audit screen.
Keep client-side pagination (already how `ContractListController`-based list
pages work — confirmed to stay this way, no move to server-side paging).

**Table columns** (existing `promo-contract-list-page` columns + these):

| column | source |
|---|---|
| Supplier (compName) | contract — existing |
| Comp type (DN/HU) | contract — existing |
| Contract label | contract — existing |
| Contract period (startDate–endDate) | contract — existing |
| **Accrual amount** *(new)* | joined, summed income-entries |
| **Settlement supplier income** *(new)* | joined, summed `supplierIncome` from settlements |
| **Has settlement (documentation status)** *(new)* | derived boolean, rendered as a status badge (e.g. "Posted" / "Missing") |
| **Latest settlement date** *(new)* | max `createdAt` across settlement rows, blank if none |

**Filters** (existing `ContractListController` filters + a new one):
- comp type (DN/HU) — existing
- supplier (compName) — existing
- contract label — existing
- **date range (period)** *(new)* — against contract `startDate`/`endDate`
  overlap with the picked range
- **documentation status** *(new, optional)* — has settlement / missing;
  worth adding since it's the actual audit question, but confirm it's wanted
  as a filter vs. just a visible column to eyeball

**`ContractListController` extension needed**: today it only filters on
compCode/compName/compType/contractLabelId (see
`shared/libs/contract-list-controller.ts`) — no date-range support. Since
this is now going on the existing PROMO list page (not a separate
PROMO-only screen), the date-range filter is being added to the **shared**
controller, which also affects order/branch list pages. That's fine per your
"refactor later if needed" steer — the accrual/settlement join columns stay
PROMO-only (computed in `promo-contract-list-page` itself, not pushed into
the shared controller), but the date-range filter primitive is reasonable to
add to `ContractListController` now since it's generically useful and cheap.

## 4. Decisions (resolved 2026-07-03)

1. `supplierOrderAmount` is **not used** for PROMO — use `supplierIncome`.
2. Multiple settlements per contract: **sum `supplierIncome`** across all of
   them; for date, use the **max** `createdAt`.
3. **No new route** — this becomes additional columns on the existing
   `promo-contract-list-page`.
4. Keep **client-side pagination** (no change to how `ContractListController`
   list pages work today).

## 5. Resulting scope (what to actually build) — see §0 for current state

- Extend `promo-contract-list-page` with new columns: accrual amount and
  settlement supplier income now come straight off the `getPromoContracts()`
  response (§0) — no join needed for those two. Has-settlement status badge
  and latest settlement date still need resolution per §0's open items.
- Add a date-range filter to `ContractListController` (shared — affects
  order/branch list pages too, acceptable per the "refactor later" steer) —
  the API now supports `startDate`/`endDate` params directly, so this is a
  straightforward pass-through rather than a client-side date comparison.
  Whether to also expose a documentation-status filter (has settlement /
  missing) alongside the date range is a small open call — default to
  including it since it's the actual audit question, but flag for a quick
  confirm during build if it adds meaningfully more complexity than a plain
  visible column.
- **Only if `latestSettlementDate` is kept** (§0): join
  `GET /v2/settlements?contractType=PROMO` client-side, grouped by
  `contractId`, in `promo-contract-list-page` itself (not pushed into the
  shared controller — that stays contract-type-agnostic) — purely to pull
  the max `createdAt`, since amounts no longer need this endpoint.
