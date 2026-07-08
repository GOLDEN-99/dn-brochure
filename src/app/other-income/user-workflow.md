this other income v2 workflow

## open concern

- not confident the current UI implementation is friendly or suitable for
  the actual requirement — this doc + the implementation refs below are a
  starting point for re-evaluating fit, not a sign-off that current screens
  are correct as-is. treat "implemented:" notes throughout as "here's what
  exists," not "here's what's right."

- reduce purchasing meaningless workload
- obtain account report requirement
- all workflow should separate by ssupplier comp type DN | HU

## cross-cutting: filtering

- all contract list pages (order/branch/promo, both purchase and account) need a
  proper filtering method — design the filter set first (fields, combinations)
  before building; current `ContractListController` filters are ad hoc per page,
  not derived from an actual requirement.
- if the design needs a filter dimension the API doesn't support (e.g. compName +
  period together, per the PROMO audit case below), **mock it and document as a
  blocking issue** rather than silently limiting the UI to what the API happens
  to expose today.

## cross-cutting: component placement

- a number of components currently live under `purchase/components/` that are
  actually shared between purchase and account (or should be promoted to
  `other-income/shared/components/`) — needs an inventory pass before any
  restructure, so shared pieces aren't duplicated or left owned by the wrong role.

# purchasing workflow

## register

- purchasing register contracts base on contract type

> implemented: `purchase/components/pages/{order,branch,promo}-contract-create-page`
> (+ `order-contract-create-cross-page` for the paired DN+HU order flow, see
> `purchase/components/features/create-paired-order-contract`). Company/product
> pickers live under `purchase/components/forms/create-*` (`create-single-comp`,
> `create-pair-company-picker`, `create-product-picker`, `create-pair-product-picker`,
> `create-period`, `product-condition-form`, `step-form` for bracket terms).
> Route-scoped state: `{Order,Branch,Promo}ContractContextService`.
>
> **blocking issue**: `create-pair-company-picker` / the paired supplier flow
> (`other-income-not-light-pair.service.ts`) is a placeholder stub, not a real
> implementation — supplier pairing (DN comp ↔ HU comp linkage) needs actual
> design/backend support before the paired create flow can be considered done.

## declare income

### PROMO

- purchasing declare accurals (compute from external system), posting settlement for those entries
- not implement v1 QOL in v2 posting entries and settlement in one step

> implemented: `purchase/components/pages/promo-contract-accruals-page` (declare)
> + `promo-contract-settlements-page` (list settlements, separate step) +
> `purchase/components/forms/add-promo-accrual-form` +
> `purchase/components/forms/create-settlement-form`.

### ORDER

- purchasing query entries to confrim with supplier; purchasing required both whole number and detail or purchasing order count in the system calculation
- after confriming, purchasing append correction entries - CN | LAG | MANUAL
- posting settlement

> implemented: `purchase/components/pages/order-contract-accruals-page` (query
> system entries) → correction forms `purchase/components/forms/{cn-correction-form,
> lag-correction-form,manual-correction-form}` (see `docs/context/supplier-lag-design.md`
> and `docs/context/2026-06-25-income-entry-corrections-changelog.md` for the
> design/rework history) → `order-contract-settlements-page` +
> `create-settlement-form` to post. These 3 correction forms currently have
> **no test coverage** (per module CLAUDE.md).

### BRACNH

- purchasing append branches, posting entires and settlement in one step (backend handle this process)

> implemented: `purchase/components/pages/branch-contract-accruals-page` +
> `purchase/components/forms/add-branch-form`; `branch-contract-settlements-page`
> exists but per this note the post is a single backend call, not a distinct
> multi-step UI like ORDER.

## acknowledge income; focus on settlement and income type

- purchasing responsible for append discount and free item to fulfil supplier income in the settlement document

> implemented: `purchase/components/pages/settlement-detail-page` (shared across
> all 3 contract types via `FOR_CONTRACT_DATA_TOKEN`, see
> `other-income/tokens/service-token.ts`) using
> `purchase/components/forms/{append-bill-discount,append-free-item,append-credit-note}`.
> known gap noted in module CLAUDE.md: `settlement-detail-page.component.ts:173`
> — no combined receipt+match endpoint, needs postReceipt then postMatch.

## audit

### PROMO

- promo base contract lives short a 1-3 month long. purchasing require a way to list all PROMO contract with supplier name(compName) in a given period to see weather they have complete contract documentation.

> implemented (partial): `purchase/components/pages/promo-contract-list-page` uses
> `ContractListController` (`shared/libs/contract-list-controller.ts`, URL-driven
> filter/pagination) — check whether it currently exposes compName + period filter
> together, or only one of the two; this is likely the "restructure" gap since the
> requirement is audit-oriented (documentation completeness), not just a plain list.

# account workflow

## estimate income

- account need to document their perviouse company balance with income type (DISCOUNT, FREE ITEM(credit note with order reference), INVOICE, CREDIT NOTE(without order reference))
- in case of contain multiple income with different income type, accounting accept no way to distintguish how much estimate amount splited

> implemented: `account/pages/{order,branch,promo}-settlements-page` +
> `account/services/other-income-account-api.service.ts`. the "no way to
> distinguish split amount" line reads as an accepted limitation, not a
> to-do — confirm before designing a splitting UI for it.

### ORDER

- account query system income

### PROMO | BRANCH

- account query supplier income

## managing invoice

- after purchasing post settlement document, account append invoice to a settlement
- accounting manage invoice - matching them with receipts
- account require report for declare to external audit how invoices-receipts are settle
- mark settlement as close

> implemented: `account/pages/account-invoice-page` +
> `account/components/form/{create-invoice,create-receipt}` +
> `account/components/other-income-invoice-receipt` (matching UI) +
> `account/pages/invoice-state-worklist-page` /
> `account/pages/settlement-worklist-page` (worklists, likely the
> "mark as close" surface). `purchase/components/forms/{append-invoice,
> append-receipt}` also exist on the purchase side — check for duplication
> vs. the account/form versions before restructuring.
>
> **blocking issue**: "mark settlement as close" today only closes at the
> top-level settlement — there's no line/PO-level audit trail backing that
> close (no status field on income entries/lines in
> `shared/types/other-income.type.ts`, no close-related field found anywhere
> in the type file). If accounting actually needs to know *which* PO lines
> were reconciled before a settlement closes, that's missing end-to-end
> (API + types + UI), not just a UI gap — needs product decision before design.

### audit DISCOUNT | FREE ITEM

- accounting check supplier credit notes referencing to purchasing order(PO), they check purchasing append data to reconsile
- mark settlement as close

> terminology note: PO-referenced income is called **DISCOUNT** in this system,
> never "credit note" — a document called credit note always means no-PO-reference
> (see next section). the line above ("credit notes referencing PO") is loose
> phrasing in the source requirement, not a literal document type — audit here
> is against `append-bill-discount` / `append-free-item` entries, not
> `append-credit-note`.
>
> implemented: likely folded into `account/pages/{order,branch,promo}-settlements-page`
> + `settlement-detail-page` (shared) rather than a dedicated audit screen —
> no distinct "audit DISCOUNT|FREE ITEM" page found; confirm whether this is
> a missing screen or intentionally reuses the settlements list/detail view.

### manage CREDIT NOTE ; NON-PO REFERENCE

- account append data to fulfill settlement
- mark settlement as close

> terminology: **credit note = always no-PO-reference**; PO-referenced =
> **discount** (see `append-bill-discount`), not credit note. keep this
> distinction consistent when designing — don't let "credit note" creep into
> PO-referenced flows or vice versa.
>
> implemented: `account/components/form/create-credit-note` and
> `purchase/components/forms/append-credit-note` — both should be exclusively
> no-PO-reference under the corrected terminology; check current code for any
> place PO reference leaks into a "credit note" labeled form/field, that would
> be a naming bug to fix during restructure.

# report

- they decide to share report both accounting and purchasing
- the v1 implemetaion of active used report in `src\app\pages\other-income\account\account-monthly-report` contain estimate income, settlemnt wating for account to work; no need to follow the v1 pattern
- the v1 accurals declaration in `src\app\pages\other-income\purchase\purchase-report`
- users say the need a report. however, they might actually need a interactive ui with excel exporting behavior
- other reports in v1 are design for future external audit. no exact/concrete requirements

> implemented: backend only so far — `docs/api/report-api.md` documents
> read-only `/v2/report/*` endpoints (e.g. `accrual-state`, per
> contract+month, excludes LAG_CORRECTION rows per
> `supplier-lag-design.md` §6.2a). **no v2 frontend page consumes this yet**
> — no `report` folder under `purchase/` or `account/` pages. this is
> the clearest "build from scratch" item in the whole doc, and per your
> note the real need may be an interactive/filterable UI with excel export
> rather than a static report page like v1's.
