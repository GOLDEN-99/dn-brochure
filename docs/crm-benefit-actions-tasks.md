# Task Breakdown — two new CRM benefit actions

> **Status: done, 2026-09-03.** Both open questions were answered and the work shipped;
> the checklists below record what was built and where it departs from the plan.
> Origin: `DrugPOSApp/docs/pages/sale/CRM-BENEFIT-PLAN.md` §3.2 — that doc holds the *why*, the
> measurements and the POS-side work. This file is only the Angular slice.
> Related: [Promotion Editor tasks](./crm-promotion-editor-tasks.md), [API Spec](./crm-promotion-edit-api-spec.md)

---

## Why this is a UI-only change

The POS (DrugPos) is growing two new promotion reward actions:

| Action | What it does | Promotion type |
| --- | --- | --- |
| *(register-fee)* | Puts goods code `11755` (ค่าสมัครสมาชิก HUG Club) on the bill at ฿0 — which is what the vendor service reads to promote a customer from custType 17 (LineCRM) to 6 (HUG Club) | `BILL` at minimum |
| *(cheapest-in-bundle)* | Makes the **N cheapest** units of the bundle free, N authored per tier | `BUNDLE` |

**`other-income-api` needs no change and is getting none — its CI/CD is down.** It can accept these
anyway: `CrmPromotionService.Validate` never whitelists `action`, and `crm_promotions.action` is
`nvarchar(100)`. So the whole authoring change is this repo plus two new strings.

---

## The two answers

1. **The action strings are `REGISTERFEE` and `CHEAPEST`.** `CHEAPEST`, not `CHEAPESTITEM`, to keep it
   clear of the `ITEM*` family. Both are asserted against the naming rules in
   `lib/crm-promotion/promotion-actions.spec.ts` — a regression guard, because a bad name fails silently
   at the till rather than loudly here.
   ⚠️ The rule is stricter than this doc first stated. The suffix list (`PRICE`, `GIFT`, `PWP`,
   `BATHDISC`, `PERCENTDISC`) comes from `CrmPromotionEngine`'s `EndsWith` dispatch, but the API adds a
   second rule: `CrmPromotionService.Validate` caps every tier's `rewardValue` at 100 for any action
   **containing** `PERCENT`, anywhere in the name — which would quietly clamp a count-based reward.
2. **`BILL` offers `REGISTERFEE`, `BUNDLE` offers `CHEAPEST`.** Both appear in their type's reward list
   (so the edit page can render a stored one), and each also gets a dedicated single-purpose create page.

Also corrected: `crm_promotions.action` is `NVARCHAR(50)`, not the `nvarchar(100)` claimed below.

---

## Subtask 1 — Register the actions

**Files:** `src/app/service/crm-promotion/crm-token.ts`, `src/app/factory/crm-promotion/create-promotion.ts`

- [x] Added `CHEAPEST` to `CRM_BUNDLE_REWARD` and `REGISTERFEE` to the new `CRM_BILL_REWARD`.
- [x] The BILL reward table was duplicated between the create factory and the edit factory; it is now one
      exported constant, so the two can no longer drift.
- [x] The action strings themselves live in `lib/crm-promotion/promotion-actions.ts`, not beside the page
      config — the config already imports the schema's form type, so declaring them there would close an
      import cycle.

`action` is a plain `string` in `crm-promotion.type.ts` — there is no union type or zod enum to widen.

---

## Subtask 2 — Labels

**File:** `src/app/lib/crm-promotion/promotion-benefit-name.pipe.ts`

- [x] One `case` per new action: `ฟรีค่าสมัครสมาชิก` and `แถมสินค้าถูกสุด(ชิ้น)`. The second doubles as
      the tier input's label on the แถมในกลุ่ม page.

⚠️ The pipe's `default` returns **"สิทธิประโยชน์ไม่ถูกต้อง"**, so an action with no label does not read as
"unknown" — it reads as *invalid*, on a promotion that is actually fine.

---

## Subtask 3 — ⚠️ `keepRewardPool` (the one that silently loses data)

**File:** `src/app/components/crm-promotion/promotion-form/promotion-form.component.ts` (~line 247)

```ts
const keepRewardPool = action === 'PWP' || action === 'GIFT';
```

- [x] **Solved differently, and better: the pool is now derived, not kept.** `buildRewardPool()` in
      `promotion-form.component.ts` returns the `11755` line for `REGISTERFEE` outright, so the pool
      cannot be lost no matter what the form holds, and no author can author it wrong. Adding the action
      to `keepRewardPool` would have left the SKU one forgotten branch away from being stripped again —
      the same shape of bug this section was warning about.
- [x] Covered by `promotion-form.component.spec.ts`, which asserts on the emitted payload rather than the
      form state, because the payload is where the SKU used to disappear.

This has happened once already on this seam: the form still sends `source`, the deployed API's
`CreatePromotionRequest` has no such member, and every promotion created since 2026-05-13 has a NULL
`source` with nobody noticing.

---

## Subtask 4 — Validation

**File:** `src/app/pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema.ts`

- [x] **Not extended to `REGISTERFEE`** — that rule validates the *form's* pool, and the register-fee pool
      is never in the form (Subtask 3). Requiring it there would fail a page that is behaving correctly.
- [x] `CHEAPEST` is out of the rule, as planned, and gained one of its own: the reward value must be a
      whole number ≥ 1. Half an item cannot be free, and a zero-unit reward is a promotion that does
      nothing at the till.

---

## Subtask 5 — Register-fee reward pool is exactly one SKU

**Files:** `promotion-form` / `promotion-gift` reward-pool section

- [x] Stronger than "constrain": there is **no pool UI at all** for this action, and the single SKU is
      derived at submit. A multi-SKU pool is meaningless — you cannot register a customer twice, and the
      POS grants once per bill regardless of what the pool holds — so the field was removed rather than
      restricted.

**Where `11755` is hardcoded — decided 2026-09-03: here, not in DrugPos.** The value lives once, in
`lib/crm-promotion/promotion-actions.ts`, and every REGISTERFEE promotion carries it to the branches as
`rewardPool[0].goodCode`:

```json
"action": "REGISTERFEE",
"rewardPool": [{ "goodCode": "11755", "itemBenefitType": "PRICE", "itemBenefitValue": 0 }]
```

DrugPos had not implemented the action when this shipped, so the POS side is free to take the SKU from
the synced promotion. It should: a second hardcode at the till would drift the day the code changes, and
that copy is the one nobody in this repo can grep for.

---

## Subtask 6 — Cheapest action: tier wording, no pool

**Files:** `benefit-select` / `benefit-tier`, `create-promotion.ts`

- [x] Labelled as a count — `แถมสินค้าถูกสุด(ชิ้น)` — via the benefit-name pipe.
- [x] No reward-pool section (it is not PWP/GIFT, so it was already hidden).
- [x] **Superseded by two dedicated pages** rather than tier wording alone. `create-register-fee`
      (ค่าสมาชิก) and `create-cheapest` (แถมในกลุ่ม) pin the action, hide the ladder controls, and leave
      exactly one number to fill in: the bill minimum, and the free-unit count. Driven by three optional
      flags on `IRewardOption` (`fixedAction`, `showThresholdInput`, `showRewardInput`), so the general
      pages needed no change.
- [x] `create-group`'s default is untouched. The cheapest page pins `thresholdValue: 1` with
      `isRepeat: true` instead, so a basket of three sets earns the reward three times — the scaling
      problem this doc warns about below simply does not arise on that page.

**The ladder itself already works — do not build anything for it.** The ใช้ซ้ำ/ทุกๆ checkbox
(`benefit-select.component.html:34`) toggles `isRepeat`, and unchecking it enables เพิ่มสิทธิประโยชน์ to add
rungs. The agreed shape is a non-repeat ladder: threshold = how many complete sets, reward = how many of
the cheapest units become free. "Any 3, cheapest free" = filter `filterValue 3` + one tier `(1 → 1)`.

⚠️ Worth telling whoever authors these: **a non-repeat ladder does not scale with the basket.** A single
rung "1 set → 1 free" gives a six-unit basket one free unit, not two. If a promotion is meant to repeat,
they add rungs or tick ใช้ซ้ำ.

---

## Subtask 7 — Specs

- [x] `promotion-form.component.spec.ts` — the payload for both new pages, including the surviving
      `11755` line and the empty pool for `CHEAPEST`.
- [x] `create-promotion.spec.ts` — both new page configs, and that each action stays selectable on its
      type's edit page (otherwise reopening a promotion would silently rewrite its action).
- [x] `promotion-actions.spec.ts` — the naming rules, as a guard for whoever adds the third action.
- [x] `promotion-benefit-name.pipe.spec.ts` — both labels, and that neither renders as
      *"สิทธิประโยชน์ไม่ถูกต้อง"*.

33 specs pass. Note the 5 pre-existing `should create` failures elsewhere under
`components/crm-promotion/` (scaffold specs that never set required inputs) — they predate this work.
