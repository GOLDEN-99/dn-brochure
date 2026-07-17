# Report Page — Screen Spec (draft)

Status: **draft, not implemented**. Companion to `user-workflow.md` § `report`.
No v2 frontend exists for this yet (see that doc's `report` section). This spec
exists to pin down what a v2 report screen needs before any UI/visual design
starts — per `user-workflow.md`'s open concern, the goal is to get requirement
fit right before investing in a look.

## 1. What v1 had (for contrast, not to copy)

- `src/app/pages/other-income/account/account-monthly-report` — estimate
  income + settlements-awaiting-account, static report.
- `src/app/pages/other-income/purchase/purchase-report` — accrual declaration
  report.
- User signal (per `user-workflow.md`): what's wanted is closer to an
  **interactive, filterable UI with Excel export**, not a static printout.
  Treat v1 as evidence of the *data shape* people needed, not the *interaction
  model* to reuse.

## 2. What the backend currently exposes

`GET /v2/report/accrual-state` (`docs/api/report-api.md`):

| field | notes |
|---|---|
| `contractId` | int |
| `contractType` | `ORDER`\|`BRANCH`\|`PROMO` |
| `month` | yyyy-MM-01 |
| `netOrderAmount` | signed net, corrections already netted in; `null` for BRANCH/PROMO |
| `estimateIncome` | signed net income for that contract+month |

Filters: `contractType` (required), `contractId`, `monthFrom`/`monthTo`. No
`state`/settlement linkage — aggregates only, explicitly documented as not
representing settlement pick status.

`GET /v2/income-entries` (`docs/api/income-entry-api.md`) is the per-row
companion — supports `state=open|picked`, same contract filters, plus
`entryType`. Use this where the report needs to break an aggregate month down
into its constituent AUTO/CN/LAG/MANUAL rows, or filter to "not yet settled."

## 3. Confirmed gap: no company info on either endpoint

Neither endpoint returns `compCode`/`compName`/`compType`. The workflow doc's
top-level requirement — **"all workflow should separate by supplier comp type
DN | HU"** — cannot be satisfied by contract-id/type filtering alone; company
identity only exists on the contract list endpoints (`TContractBase` has
`compCode`/`compName`/`compType`).

**This is a blocking issue for the report screen**, same category as the
filtering concern already flagged in `user-workflow.md`. Two ways to close it:

- **(a)** client-side join: fetch contract list (already has compCode/compType)
  once, join against report rows by `contractId` in the frontend.
- **(b)** ask backend to add `compCode`/`compType` to the report view directly
  (`vw_other_income_accrual_state`), avoiding an N-contract-list-fetch on every
  report load.

(a) is faster to prototype/mock; (b) is the right shape long-term if report
volume grows. Recommend mocking (a) first to validate the screen design, then
filing (b) as a backend follow-up — consistent with "mock and document as
blocking issue" from `user-workflow.md`.

## 4. Proposed screen shape (draft, for review — not final)

**Route**: new page under a `report/` folder — per the component-placement
concern in `user-workflow.md`, this should live under `shared/` (or a new
top-level `report/` sibling to `purchase/`/`account/`) since both roles need
it, not nested under either `purchase/` or `account/`.

**Primary view**: table, one row per (contract, month), matching the API
grain directly — no pre-aggregation across months in v1.

| column | source | notes |
|---|---|---|
| Supplier (compName) | joined from contract list (§3) | groupable/filterable |
| Comp type (DN/HU) | joined from contract list (§3) | required top-level filter per workflow doc |
| Contract type | `contractType` | ORDER / BRANCH / PROMO |
| Contract | `contractId` (+ label from contract list) | |
| Month | `month` | |
| Net order amount | `netOrderAmount` | null for BRANCH/PROMO — render as "—" not "0" |
| Estimate income | `estimateIncome` | |
| Settlement status | **not available** — needs `income-entries?state=` per-row drill-down, not on this aggregate row | see §5 |

**Filters** (per the cross-cutting filtering concern — design before building):
- comp type (DN/HU) — required per workflow doc line 5
- supplier (compName) — free text or picker, sourced from joined contract data
- contract type (ORDER/BRANCH/PROMO)
- month range (`monthFrom`/`monthTo`, matches API)
- contract (single, optional — matches API's optional `contractId`)

**Export**: Excel export of the current filtered table, client-side
(e.g. `xlsx`/`exceljs` — check if one is already a project dependency before
adding a new one) rather than a backend-generated file, since the data is
already fully client-side after the join in §3(a).

**Relationship to existing per-contract accrual pages** (`purchase/components/pages/
{order,branch,promo}-contract-accruals-page`): this is a **separate screen, not
merged into those**. The existing accrual pages are single-contract,
purchasing-only, action-oriented (declare/query/append entries for one
contract you've already drilled into). The report is cross-contract,
cross-supplier, read-only, shared by both roles — different job, entered a
different way (filter/search first, not drill-down-then-view). Each report
row should carry a **drill-down link** into that contract's existing
`*-contract-detail-page` (or accruals page, for purchasing users) so the two
stay connected without merging — clicking a report row takes you to the
contract, not the other way around.

**Not addressed by this endpoint** (flag if the user asks for these — they
need `income-entries`, not `report/accrual-state`):
- per-entry-type breakdown within a month (AUTO vs CN vs LAG vs MANUAL)
- open vs. picked/settled status
- drill-down to the settlement a month's entries landed in

## 5. Decisions (resolved 2026-07-03)

1. **Company-data join** — build the frontend against the joined shape now
   (mock `compCode`/`compName`/`compType` merged onto report rows, sourced by
   client-side join against contract list per §3(a)). Treat the eventual
   backend view change (§3(b), adding these fields to
   `vw_other_income_accrual_state` directly) as the target shape to converge
   on — the frontend data-access layer should be written so swapping the
   mock/join for a real joined API response later is a one-place change (e.g.
   an isolated `report.service.ts` mapping function), not a template rewrite.
2. **Settlement status** — **out of scope for v1.** Ship amounts-only
   (supplier, comp type, contract, month, netOrderAmount, estimateIncome).
   Do not join `income-entries` state for the first version; revisit as a v2
   enhancement once the base screen is validated with users.
3. **Role scoping** — **one combined screen**, same columns, for both
   purchasing and accounting. Gate access by permission/route guard, not by
   building separate screens. No v1-style purchase-report/account-report
   split.
4. **Export scope** — Excel export covers the **full filtered dataset**
   (respects active filters, ignores pagination). Since data is already
   fully client-side after the §3(a) join, this doesn't need a separate
   "export" API call — export from the same in-memory filtered array the
   table renders from.

## 6. Resulting v1 scope (what to actually build)

- One route, one page component, no role branching.
- Data: `GET /v2/report/accrual-state` + contract-list fetch, joined
  client-side in a `report.service.ts`-style mapping layer (isolate the join
  so it's a one-place swap when/if backend adds the fields directly).
- Columns: Supplier (compName), Comp type (DN/HU), Contract type, Contract,
  Month, Net order amount (`—` for null), Estimate income. No settlement
  status column.
- Filters: comp type, supplier, contract type, month range, contract
  (optional single-contract).
- Excel export button: dumps the full filtered in-memory dataset, not tied
  to pagination.
- Explicitly deferred (do not build now): per-entry-type breakdown,
  open/picked status, drill-down to settlement, role-specific views.
