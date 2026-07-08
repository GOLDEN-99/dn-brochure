# Blocking Issues — V2 UI Restructure

Status: **tracking doc**, consolidated 2026-07-03. Pulls together every
"blocking issue" flagged while designing the v2 restructure
(`user-workflow.md` and the per-screen specs in this folder) into one list.
Each item names what's missing, why it blocks frontend work, and where it
was first raised — read the linked section for full context before acting.

## Resolved

### Order contract list bracket/step data — RESOLVED 2026-07-03

Backend delivered: `GET /v2/order-contracts` now returns
`cumulativeOrderAmount`, `calcType`, and `currentBracket` directly per row,
plus `startDate`/`endDate` overlap filters. Exactly what was asked. See
`order-list-cumulative-step-spec.md` §0 for the new response shape and
remaining frontend-only follow-up work (types, service params, columns,
API doc update).

### PROMO audit list join — RESOLVED 2026-07-03

Backend delivered: `GET /v2/promo-contracts` now returns
`entriesAmountTotal` and `settlementsSupplierIncomeTotal` directly per row,
plus `startDate`/`endDate` overlap filters. This wasn't originally filed as
a blocking API issue (the client-side join was considered sufficient), but
the backend closed the gap anyway. See `promo-audit-list-spec.md` §0/§6.

Also resolved as part of this: whether `settlementsSupplierIncomeTotal`
of exactly `0` can safely mean "no settlement" for the has-settlement status
badge. Verified directly against the live API
(`https://api.otherincome.healthupgroup.com/v2/promo-contracts`) — a
contract with zero income entries returns `entriesAmountTotal: 0`, not
`null` or an omitted field, confirming `0` is the API's genuine "no data"
sentinel. No separate `hasSettlement`/`settlementCount` field needed from
backend.

## Backend API changes still needed

### 1. Report view needs supplier identity fields

**Still confirmed missing** — re-verified directly against the live API
2026-07-03 (`https://api.otherincome.healthupgroup.com/v2/report/accrual-state?contractType=order`):
response rows are still just `contractId`/`contractType`/`month`/
`netOrderAmount`/`estimateIncome`, no `compCode`/`compName`/`compType`.

This is a **different endpoint** than the order/promo contract list
endpoints (`/v2/order-contracts`, `/v2/promo-contracts`) which already
carry `compCode`/`compName`/`compType` as their own contract fields and
always have — that was never the gap. The gap is specifically
`/v2/report/accrual-state` (the aggregate accrual view backing the report
page), which is a separate view/query with no company join at all. The
top-level requirement in `user-workflow.md` ("all workflow should separate
by supplier comp type DN | HU") can't be met by this endpoint alone.

- **Interim**: frontend does a client-side join against the contract-list
  endpoints (which do have compCode/compType) — see
  `report-page-spec.md` §3(a)/§5.1. This is what's being built now.
- **Ask**: add `compCode`/`compType` (and ideally `compName`) directly to
  `vw_other_income_accrual_state` so the report doesn't need a second
  fetch+join on every load.
- Source: `report-page-spec.md` §3, §5.1.

*(Note: PROMO's audit-list join — originally scoped as a client-side join
against settlements + income-entries by `contractId` — was **also** resolved
backend-side 2026-07-03: `GET /v2/promo-contracts` now returns
`entriesAmountTotal`/`settlementsSupplierIncomeTotal` directly. See
`promo-audit-list-spec.md` §6 for details. So both list-column asks (order
and promo) ended up backend-delivered, not client-side joins as originally
planned.)*

## Product/design decisions still needed (not API gaps)

### Paired-supplier flow is an unfinished stub

`create-pair-company-picker` and `other-income-not-light-pair.service.ts`
(the DN↔HU supplier pairing UI for the paired order-contract create flow)
are placeholder implementations, not real ones. Supplier pairing needs
actual design + backend support before the paired create flow can be
considered done — this predates the report/order-list specs and is a
separate, larger gap.

- Source: `user-workflow.md`, register section note.

### Settlement "close" has no line/PO-level audit trail

"Mark settlement as close" only closes at the top-level settlement — there's
no status field on individual income entries/lines in
`shared/types/other-income.type.ts`, and nothing tying a close action to
which specific PO lines were reconciled. If accounting needs that
granularity (the workflow doc's "audit DISCOUNT|FREE ITEM" section implies
line-level PO reconciliation), this is missing end-to-end — API, types, and
UI — not just a UI gap.

- **Needs a product decision first**: does accounting actually require
  line-level audit trail before close, or is top-level close sufficient
  today? Don't build against this until that's answered.
- Source: `user-workflow.md`, managing invoice section note.

## Terminology fix (no blocking, but worth flagging alongside these)

Not a build blocker, but recorded here since it surfaced during the same
review: **credit note = always no-PO-reference; PO-referenced income is
called "discount,"** never "credit note." Some existing code/labels may
conflate these — worth a naming audit during the restructure, not urgent on
its own. See `user-workflow.md`, "manage CREDIT NOTE" section note.

## Suggested next step

Item 1 (report view) is the one remaining backend ask, same shape as the two
now-resolved items above (promote fields from detail/derived data onto a
list response) — worth filing with whoever delivered the order/promo
changes, likely a quick follow-up given the pattern is established. The
paired-supplier stub and settlement-close audit trail are unrelated to each
other and to item 1 — file separately, and resolve the "does accounting
need this" question on the settlement-close item before scoping it as work.
