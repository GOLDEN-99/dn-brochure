# Other Income Module

V2 rewrite of the pre-rewrite `src/app/pages/other-income/` module (see
`docs/API_REFERENCE.md` / `docs/EXAMPLES.md` at repo root for the old,
stale v1 reference). Tracks supplier-funded income across three contract
types: DC/Rebate (order-based), Display Fee (branch-based), and Promotion
(manual entry). Two roles use overlapping views of the same data:
**Purchasing** sets up contracts and posts settlements; **Accounting**
reviews and reconciles them (invoices, receipts, credit notes).

For business rules, API shapes, and design history, see `docs/`:

- `docs/context/settlement-reference.md` — **current** settlement/income-entry
  computation model (start here for anything settlement-related).
- `docs/context/decisions.md` — original v2 design log (schema, per-track
  API tables); CN-specific sections are flagged stale/superseded inline.
- `docs/context/system-review.md` — original business problem framing +
  stakeholder Q&A (Day-5 deadline vs. supplier confirmation lag, etc).
- `docs/context/supplier-lag-design.md` — lag-correction design (implemented
  2026-07-01).
- `docs/context/2026-06-25-income-entry-corrections-changelog.md` — CN/lag
  correction rework changelog.
- `docs/api/*.md` — REST API reference per feature area.

## Folder Structure

```
src/app/other-income/
├── routes/
│   └── other-income.route.ts       Mounts PURCHASE_ROUTES + ACCOUNT_ROUTES
├── tokens/
│   └── service-token.ts            FOR_CONTRACT_DATA_TOKEN — lets shared
│                                    components (e.g. settlement-detail-page)
│                                    stay contract-type-agnostic
├── docs/                           Business/API context (see above)
├── purchase/                       Purchasing role: contract setup, accruals, settlements
│   ├── purchase.routes.ts
│   ├── components/
│   │   ├── features/               create-order-contract, create-paired-order-contract (DN+HU)
│   │   ├── forms/                  ~20 forms: create-*, append-*, cn-correction,
│   │   │                           lag-correction, manual-correction, step-form (brackets)
│   │   └── pages/                  {order,branch,promo}-contract-{list,create,detail,
│   │                                accruals,settlements}-page, settlement-detail-page
│   └── services/                   *-context.service.ts (per contract type, route-scoped
│                                    state), other-income-purchase-api.service.ts,
│                                    -period/-search-comp/-search-order/-search-product
├── account/                        Accounting role: review, reconcile, match documents
│   ├── account.routes.ts
│   ├── components/
│   │   ├── form/                   create-credit-note, create-invoice, create-receipt
│   │   └── other-income-invoice-receipt/  invoice/receipt matching UI
│   ├── pages/                      account-invoice-page, {branch,order,promo}-settlements-page,
│   │                                settlement-worklist-page, invoice-state-worklist-page
│   └── services/                   other-income-account-api.service.ts, -period.service.ts
└── shared/                         Cross-cutting: used by both roles
    ├── components/
    │   ├── layout/                 Per-contract-type shells, one set per role
    │   │                            ({order,branch,promo}-contract-layout,
    │   │                            account-{order,branch,promo}-contract-layout)
    │   ├── pages/                  {branch,order,promo}-contract-specs-page (read-only terms)
    │   ├── other-income-event-select/, other-income-income-select/
    │   └── period-display/
    ├── libs/
    │   ├── contract-list-controller.ts  URL-driven filter/pagination (see its own
    │   │                                CLAUDE.md in this folder)
    │   ├── other-income-schema.ts       Zod schemas
    │   ├── settlement-labels.ts
    │   └── date-time.ts
    ├── services/                   other-income-event.service.ts, other-income-income.service.ts
    └── types/
        └── other-income.type.ts    Central request/response/domain types (~485 lines)
```

## Architecture

- **Angular 21, standalone components, signals throughout** (`signal()`,
  `computed()`, `input()`/`output()`, `toSignal()` for observables) — no
  NgModules, no RxJS-heavy state management.
- **Routing**: lazy-loaded via `loadComponent()`, wrapped in
  `.catch(handleLazyLoadError(...))`. `other-income.route.ts` mounts
  `purchase.routes.ts` and `account.routes.ts` under `v2/other-income`. Each
  defines per-contract-type (order/branch/promo) list/create/detail routes,
  with nested children (`specs`, `accruals`, `settlements`,
  `settlements/:settlementId`) under a shared layout per contract type.
- **State**: no global store. Contract-scoped state lives in "context"
  services (`OrderContractContextService`, `BranchContractContextService`,
  `PromoContractContextService`, `SettlementContextService`), provided at
  route level via route `providers:` — scoped to that route subtree, torn
  down on navigation away. `FOR_CONTRACT_DATA_TOKEN` + `useExisting` lets
  contract-type-agnostic shared components (`SettlementDetailPageComponent`,
  layouts) depend on an interface rather than a concrete context service.
- **List pages**: `ContractListController` (plain class, not a service —
  see `shared/libs/CLAUDE.md`) encapsulates URL-query-param-driven
  filter/pagination, shared by all three `*-contract-list-page` components.
- **Validation**: zod (`shared/libs/other-income-schema.ts`,
  `purchase/components/forms/create-schema.ts`).
- **Types**: centralized in `shared/types/other-income.type.ts`, organized
  by comment-banner sections per track/feature rather than split into
  many files.

## Known Gaps / Things To Check Before Building On This

- `settlement-detail-page.component.ts:173` — `TODO: v2 has no combined
  receipt+match endpoint — needs postReceipt then postMatch`.
- New correction flows (CN/lag/manual correction, per the 2026-06-25
  changelog) shipped with **no test coverage**. Most `.component.ts` files
  have no `.spec.ts`; specs cluster around services/libs.
- Purchase vs. account layouts are duplicated per contract type (6 layout
  components for 3 conceptual shells × 2 roles) — not yet consolidated.
- The business logic here is **actively changing** (settlement creation
  payload changed 2026-07-02) — check `docs/context/settlement-reference.md`
  before assuming any settlement-related shape is final.
- Many purchase forms import UI controls from `src/app/components/crm-promotion/`
  (e.g. `SignalMonthPickerComponent`, `FormAlertTextComponent`). That folder is
  also used by the unrelated legacy `src/app/pages/crm-promotion/` module —
  it's shared, not owned by this module. Editing anything there for this
  module's sake can silently break legacy CRM Promotion pages (this already
  happened once with `src/app/components/date-input/`, which broke legacy
  Other Income's `(dateChange)` bindings when its API was changed for v2).
  Prefer adding new v2-only components under `other-income/shared/components/`
  instead of modifying shared `components/crm-promotion/` files in place.
