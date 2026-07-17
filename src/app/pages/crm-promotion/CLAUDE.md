# CRM Promotion Module

Staff-facing tool for authoring retail promotions: create, list, view, edit,
and activate/deactivate promotions, plus manage the reusable branch and
product groupings promotions draw on. A legacy-style feature domain (pages
under `src/app/pages/crm-promotion/`, components/services/types in the
shared top-level folders rather than self-contained here).

Despite the folder name, this module talks to the **Other Income API**
(`environment.oi + '/crm'`) — that is its only backend. It shares no state or
components with the `src/app/other-income/` module beyond the UI controls
noted under "Shared UI" below.

## Where the pieces live

This module is spread across the legacy top-level folders, not one tree:

```
src/app/
├── routes/crm-promotion.route.ts        Mounted at /crm-promotion
├── pages/crm-promotion/
│   ├── promotions/                      List page + promotion-detail page
│   ├── create/create-bill-discount-promotion/
│   │   ├── create-bill-discount-promotion.component.ts   Thin page — all 3 create routes
│   │   └── createPromotionSchema.ts     Signal-forms schemas + initial* consts + form type
│   ├── edit/edit-promotion.component.ts Thin page — /:id/edit
│   └── config/                          Reusable group admin: branches/, products/
├── components/crm-promotion/
│   ├── promotion-form/                  PromotionFormComponent — the whole form
│   ├── create-promotion-subform/        promotion-master/-datetime/-limit-usage/-product-filter
│   └── (benefit-*, inline-*, promotion-*, product-picker, ...)  Field-level controls
├── factory/crm-promotion/
│   ├── create-promotion.ts              provideCreatePromotionConfig / provideEditPromotionConfig
│   └── promotion-detail-to-form.ts      TPromotionDetail -> TCreatePromotionForm
├── service/crm-promotion/               crm-promotion (CRUD), branch-config, product-config,
│                                        product-group-config, member-config, crm-token
├── layout/crm-promotion-layout/         Shell for all /crm-promotion routes
├── lib/crm-promotion/                   Display pipes (promotion-type, -order, -priority,
│                                        -threshold, -benefit-name, product-name)
└── types/crm-promotion.type.ts          All domain/request/response types
```

Docs at repo root: `docs/crm-promotion-edit-api-spec.md` (PUT contract +
backend-enforced business rules), `docs/crm-promotion-editor-tasks.md`
(edit-feature task log; its end-to-end checklist is still unchecked).

## Three promotion types, one form

All three types share `PromotionFormComponent`. Type differences are pushed
into an injected config object rather than branched inside the form.

| Type     | Create route    | Label                | Threshold options            |
| -------- | --------------- | -------------------- | ---------------------------- |
| `BILL`   | `create-bill`   | ส่วนลดท้ายบิล        | `BILLSUBTOTAL`, `BILLCOUNT`  |
| `BUNDLE` | `create-group`  | ส่วนลดตามกลุ่มสินค้า | `BUNDLECOUNT`                |
| `ITEM`   | `create-inline` | ลดรายสินค้า          | none — always `ITEMEXIST`    |

`CRM_PAGE_CONFIG` (`service/crm-promotion/crm-token.ts`) is the mechanism. It
carries `pageName`, `initialData`, `filterOption` (four booleans gating which
filter widgets render) and `rewardOption` (which reward actions / threshold
types are selectable). Create routes provide it via
`provideCreatePromotionConfig(path)` keyed on route path; the edit page
provides it via `provideEditPromotionConfig(detail)` keyed on
`detail.promotionType`. **Adding a promotion type means adding a case to both
factories** — they duplicate the same filter/reward tables.

`EditPromotionComponent` provides the token in its own `@Component.providers`
with a `useFactory` that reads `ActivatedRoute.snapshot.data['detail']`, not
in the route's `providers` block. This is deliberate: providing at route level
with `deps: [ActivatedRouteSnapshot]` caused a circular dependency.

## Form architecture

`PromotionFormComponent` owns all form state and is shared by create and edit.
Pages are thin: they pass `submitLabel` / `submitting` / optional
`initialData`, project a header via `slot="header"`, and handle the
`submitted` output (which emits a finished `TCreatePromotionRequest`) by
calling the service and navigating.

One `formModel` signal of type `TCreatePromotionForm` holds six sections —
`promotionMaster`, `promotionDatetime`, `promotionMember`, `promotionBranch`,
`promotionFilter`, `promotionBenefit` — wrapped by
`form(this.formModel, createPromotionSchema)` from `@angular/forms/signals`.
Every handler is an immutable `formModel.update(...)`. No `ReactiveFormsModule`.

### Three shapes for the same data

The conversions between these are where the real logic sits:

- **`TPromotionDetail`** — `GET /crm/promotions/:id`. ISO date strings,
  `activeDays` as `"1111111"`, priority/order as numbers.
- **`TCreatePromotionForm`** — the form model. `NgbDateStruct`/`NgbTimeStruct`,
  `activeDay` as a 7-tuple of booleans, priority/order as **strings** (they
  bind to `<select>`), products as full objects.
- **`TCreatePromotionRequest`** — POST/PUT body. Back to ISO strings, binary
  string, numbers; products flattened to bare `goodCode` strings.

Detail→form is the exported pure function in `factory/crm-promotion/
promotion-detail-to-form.ts`. Form→request is the **private** `buildRequest()`
inside `promotion-form.component.ts`. They are inverses in effect but not in
structure or location — change one, check the other.

## Validation

All in `createPromotionSchema.ts` as signal-forms schemas, Thai messages.
`docs/crm-promotion-edit-api-spec.md` documents the same rules as
backend-enforced, so these are duplicated on both sides — keep them in sync.
The non-obvious ones:

- `source === 'HU'` forces and disables `promotionOrder = '0'`.
- Tiers need distinct `thresholdValue` **and** distinct `rewardValue`;
  `isRepeat = true` means exactly one tier.
- Actions containing `"PERCENT"` cap `rewardValue` at 100.
- `PWP` / `GIFT` require a non-empty `rewardPool`.
- All filter groups must share one `filterType`; no `goodCode` may appear in
  two groups.
- `limitTime` gates the timespan sub-schema; start and end may not both be
  `00:00`.
- `promotionType !== 'BILL'` requires at least one filter group.

## Services

`CrmPromotionService` (root) is the promotion CRUD surface: `allPromotions`
signal, `createPromotion`, `getPromotionById`, `updatePromotion`,
`togglePromotionStatus`. Cache invalidation idiom throughout this module is a
counter signal + `toObservable` + `switchMap` re-fetch, exposed as a
`refetch*()` method — `BranchConfigService`, `ProductConfigService` follow it
too. `ProductGroupConfigService` is the only route-scoped service (provided on
`config-product/:productGroupId`); it mostly re-exports `ProductConfigService`
members.

## Known gaps / check before building on this

- **`CrmGroupService` is an empty shell** — decorator and imports, no members.
  It has a `.spec.ts`. Don't assume it does anything.
- **The entire edit feature ships untested**: no `.spec.ts` for
  `promotion-form.component.ts`, `promotion-detail-to-form.ts`,
  `edit-promotion.component.ts`, or `factory/crm-promotion/create-promotion.ts`.
  The end-to-end checklist in `docs/crm-promotion-editor-tasks.md` is also
  entirely unchecked — that flow may never have been verified manually.
  `promotion-detail-to-form.ts` is a pure function and the cheapest place to
  start.
- `ProductConfigService` has both a `fetchAllProducts()` method and an
  `allProduct` signal hitting the same `/all-products` endpoint, plus
  commented-out dead code. `ProductGroupConfigService` also carries a
  commented-out block.
- `initialBenefit.thresholdType` is `'BILLBATH'`, which is not a value in any
  `thresholdList` — every factory case overrides it, so nothing reads the
  default, but don't trust it as a reference value.
- The create page component is still named
  `CreateBillDiscountPromotionComponent` but serves all three create routes.

## Shared UI — the trap

`src/app/components/crm-promotion/` is **not owned by this module**.
`SignalMonthPickerComponent` and `FormAlertTextComponent` there are also
imported by `src/app/other-income/` v2 forms, which is unrelated to this
module. Editing them in place for a CRM Promotion need can silently break
Other Income v2 — this class of breakage has already happened once with
`src/app/components/date-input/`. Prefer adding module-scoped components
rather than changing shared `components/*` files in place.
