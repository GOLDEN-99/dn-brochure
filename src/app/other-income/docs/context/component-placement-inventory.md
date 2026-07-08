# Component Placement Inventory (draft)

Status: **draft, findings verified against code 2026-07-03**. Follows up on
`user-workflow.md`'s cross-cutting note: "a number of components currently
live under `purchase/components/` that are actually shared between purchase
and account (or should be promoted to `other-income/shared/components/`)."
This is that inventory pass.

Scope: `purchase/components/forms/` and `purchase/components/features/`,
checked against actual imports (not just naming) — every "shared"/"dead"
claim below is grep-verified, not inferred from folder names.

## 1. Confirmed misplaced — move to `shared/`

**`purchase/components/forms/add-branch-form`** — imported by
`shared/components/pages/branch-contract-specs-page`
(`branch-contract-specs-page.component.ts`). A `shared/` page already
depends on a `purchase/`-owned component. This is not a "could be shared"
candidate, it's already functioning as shared code from the wrong folder.
**Move to `shared/components/`.**

## 2. Confirmed dead — delete, do not move

**`purchase/components/forms/create-period`** (the v2 one, under
`src/app/other-income/`) — zero imports anywhere outside its own component
file, verified via grep across the whole `other-income/` tree.
`shared/components/edit-period-modal` is the real, wired-in period-editing
implementation. `create-period` appears to be an earlier, superseded attempt
at the same thing.

Note: there is a **separate, unrelated** `CreatePeriodComponent` at
`src/app/components/other-income/create/create-period/` (outside the
`other-income/` v2 tree entirely) — that one is real v1 code, still used by
v1 pages `not-light-dual-detail` and `not-light-single`. Same component
name, different folder, different module, no relation. Don't touch the v1
one — only the v2 copy under `src/app/other-income/purchase/components/forms/create-period`
is dead. **Delete the v2 copy.** Moving it to `shared/` would just relocate
dead code and invite confusion with `edit-period-modal`.

## 3. `account/components/form/{create-invoice,create-receipt,create-credit-note}` — confirmed dead, delete

Initially flagged as "duplicates purchase's append-* forms, needs
reconciliation." Investigation instead found these are **v1-pattern leftovers
with zero references anywhere** — not live duplicates.

- All three (`create-invoice`, `create-receipt`, `create-credit-note`) are
  **modals** (`modal-header`/`modal-body`/`modal-footer`, `closeModal.emit()`)
  — the v1 UI pattern, confirmed by inspecting each template.
- All three are **unreferenced** — grepped `CreateInvoiceComponent`,
  `CreateReceiptComponent`, `CreateCreditNoteComponent` across the whole
  `other-income/` tree; each only matches its own component file. (An
  earlier note in this doc claimed `create-credit-note` was imported by a
  `shared/components/period-display` — that was a stale/incorrect grep
  result; no `period-display` component exists in the tree at all. Corrected
  here.)
- `purchase/components/forms/append-{invoice,receipt,credit-note}` are the
  live v2 forms — inline/row-based, signal-forms pattern
  (`app-form-alert-text`, `[formField]`, no modal chrome) — and are what's
  actually used today for all three document types, purchase and account
  alike (need to confirm account's pages actually invoke `append-*` rather
  than nothing at all, but the `create-*` trio is confirmed not it).

**Per user confirmation (2026-07-03): all three `create-*` account forms can
be safely deleted.** This is not a migration task — there's nothing live to
migrate away from.

| Document type | Live v2 form | Dead v1-pattern leftover (delete) |
|---|---|---|
| Invoice | `purchase/components/forms/append-invoice` | `account/components/form/create-invoice` |
| Receipt | `purchase/components/forms/append-receipt` | `account/components/form/create-receipt` |
| Credit note | `purchase/components/forms/append-credit-note` | `account/components/form/create-credit-note` |

## 4. Generic/reusable, unused elsewhere — lower-priority move candidates

Not yet imported outside `purchase/`, but shaped as generic UI rather than
purchase-specific business logic. Lower priority than §1/§2 since nothing is
broken by their current location — worth moving only when something outside
`purchase/` actually needs them, to avoid moving speculatively.

- `create-pair-company-picker`, `create-pair-product-picker`,
  `create-product-picker` — generic pickers, no purchase-specific coupling
  found.
- `search-supplier-company` — generic typeahead, but currently a **stub**:
  returns mocked data (`of([{compCode:'test',...}])`), not wired to a real
  search API. Don't move as-is; note the stub status if/when someone picks
  this up for reuse — moving a stub to `shared/` risks it looking
  production-ready when it isn't.

## 5. Genuinely purchase-only — correctly placed, no action

`add-promo-accrual-form`, `append-bill-discount`, `append-free-item`,
`cn-correction-form`, `create-pair-head`, `create-settlement-form`,
`create-single-comp`, `create-single-comp-without-product`,
`create-single-head`, `lag-correction-form`, `manual-correction-form`,
`product-condition-form`, `step-form` (despite the generic-sounding name,
tightly coupled to `TCalcSpecForm` bracket/cumulative calc schema — not
reusable outside order-contract creation), `features/create-order-contract`,
`features/create-paired-order-contract`.

## 6. Suggested order of work

1. Delete the v2 `create-period` (§2) — zero risk, unreferenced within
   `other-income/`. Do not touch the unrelated v1 `create-period` under
   `src/app/components/other-income/create/`.
2. Move `add-branch-form` to `shared/components/` (§1) — mechanical move,
   update the one import site.
3. Delete `account/components/form/{create-invoice,create-receipt,
   create-credit-note}` (§3) — confirmed unreferenced, zero risk, same as
   §2. `purchase/components/forms/append-*` already covers these document
   types for both roles.
4. Move §4 candidates opportunistically, only when a real second consumer
   shows up — don't move preemptively.
