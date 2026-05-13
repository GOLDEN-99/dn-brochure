# Task Breakdown — Promotion Editor Feature

> Branch: `fix-promotion-2`
> Reference: [API Spec](./crm-promotion-edit-api-spec.md)

---

## ✅ Subtask 1 — Service: add `updatePromotion`

**File:** `src/app/service/crm-promotion/crm-promotion.service.ts`

- Added `updatePromotion(id: number, req: TCreatePromotionRequest): Observable<void>`
- Uses `this.api.put(...)` — method already existed on `ApiService`

---

## ✅ Subtask 2 — Data mapper: `TPromotionDetail` → `TCreatePromotionForm`

**File:** `src/app/factory/crm-promotion/promotion-detail-to-form.ts` *(new)*

Pure function `promotionDetailToForm(d: TPromotionDetail): TCreatePromotionForm`

| Source (`TPromotionDetail`)            | Target (`TCreatePromotionForm`) | Transform                        |
| -------------------------------------- | ------------------------------- | -------------------------------- |
| `startdate` / `enddate`                | `promotionMaster.dateRange`     | `"YYYY-MM-DD"` → `NgbDateStruct` |
| `startTime` / `endTime`                | `promotionDatetime.timeSpan`    | `"HH:MM:SS"` → `NgbTimeStruct`   |
| `activeDays`                           | `promotionDatetime.activeDay`   | `"1111110"` → `[bool×7]`         |
| `promotionPriority` / `promotionOrder` | same fields                     | `number` → `string`              |
| All other fields                       | direct copy                     | —                                |

---

## ✅ Subtask 3 — Factory config for edit mode

**File:** `src/app/factory/crm-promotion/create-promotion.ts`

Added `provideEditPromotionConfig(detail: TPromotionDetail): ICrmPageConfig`
- Calls `promotionDetailToForm(detail)` for `initialData`
- Derives `filterOption` and `rewardOption` from `detail.promotionType`

---

## ✅ Subtask 4 — Extract shared `PromotionFormComponent`

**Architecture change** from original plan: instead of adding edit mode directly into `CreateBillDiscountPromotionComponent`, a shared form component was extracted.

**New file:** `src/app/components/crm-promotion/promotion-form/promotion-form.component.ts`

- Owns all form logic: `formModel`, all section handlers, `promotionForm`, full template
- Inputs: `submitLabel`, `submitting`, `initialData` (optional override of config initial data)
- Output: `submitted` — emits `TCreatePromotionRequest` on save button click
- `slot="header"` content projection so each page injects its own title/back button
- `CRM_PAGE_CONFIG` injected here for filter/reward options and default initial data

**`CreateBillDiscountPromotionComponent`** slimmed to a thin page:
- Injects `NgbCalendar`, passes today's date via `[initialData]`
- Listens to `(submitted)` → calls `createPromotion` → navigates to `/crm-promotion`

---

## ✅ Subtask 5 — New `EditPromotionComponent` page

**New file:** `src/app/pages/crm-promotion/edit/edit-promotion.component.ts`

- Provides `CRM_PAGE_CONFIG` in its own `@Component.providers` using `useFactory` that calls `inject(ActivatedRoute).snapshot.data['detail']` — avoids the circular dependency that occurs when providing via route `providers` with `deps: [ActivatedRouteSnapshot]`
- Reads `id` from `ActivatedRoute.snapshot.paramMap`
- Listens to `(submitted)` → calls `updatePromotion(id, req)` → navigates to `/crm-promotion/:id`

---

## ✅ Subtask 6 — Route `/crm-promotion/:id/edit`

**File:** `src/app/routes/crm-promotion.route.ts`

- Added `":id/edit"` route with `resolve: { detail: ... }` that calls `getPromotionById`
- `loadComponent` → `EditPromotionComponent`
- No `providers` block needed (config is provided inside the component itself)

---

## ✅ Subtask 7 — "Edit" button on detail page

**File:** `src/app/pages/crm-promotion/promotions/promotion-detail.component.html`

Added `<a routerLink="['/crm-promotion', detail()!.id, 'edit']">แก้ไข</a>` next to the toggle-status button.

---

## End-to-end verification checklist

- [ ] BILL promotion: open detail → click แก้ไข → form pre-filled → change name + dates → submit → detail shows updated values
- [ ] BUNDLE promotion: edit filter groups (add/remove product, add/remove group) → submit
- [ ] ITEM promotion: edit product filter → submit
- [ ] Tier list: add tier, remove tier, duplicate value validation fires
- [ ] Branch/member: toggle specific, add and remove items
- [ ] Create mode: still works (no regression)
- [ ] Network tab: `PUT /crm/promotions/{id}` called with correct body shape
