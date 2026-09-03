# Task Breakdown — two new CRM benefit actions

> **Status: not started. Blocked on two answers (see "Before starting").**
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

## Before starting

1. **The exact action strings are not settled yet.** Placeholders below. ⚠️ Whatever is chosen **must not
   end in** `PRICE`, `GIFT`, `PWP`, `BATHDISC` or `PERCENTDISC` — the POS engine routes by suffix, and a
   name ending in one of those is silently handled as that other action.
2. **Which promotion types may offer the register-fee action** — `BILL` is certain; `BUNDLE`/`ITEM` are
   open.

Confirm both with the POS side before merging, or the strings will have to be migrated in the DB.

---

## Subtask 1 — Register the actions

**Files:** `src/app/service/crm-promotion/crm-token.ts`, `src/app/factory/crm-promotion/create-promotion.ts`

- [ ] Add the cheapest action to `CRM_BUNDLE_REWARD`.
- [ ] Add the register-fee action to the `create-bill` page's `rewardOption.rewardList` (and to any other
      promotion type the answer to Q2 includes).

`action` is a plain `string` in `crm-promotion.type.ts` — there is no union type or zod enum to widen.

---

## Subtask 2 — Labels

**File:** `src/app/lib/crm-promotion/promotion-benefit-name.pipe.ts`

- [ ] One `case` per new action.

⚠️ The pipe's `default` returns **"สิทธิประโยชน์ไม่ถูกต้อง"**, so an action with no label does not read as
"unknown" — it reads as *invalid*, on a promotion that is actually fine.

---

## Subtask 3 — ⚠️ `keepRewardPool` (the one that silently loses data)

**File:** `src/app/components/crm-promotion/promotion-form/promotion-form.component.ts` (~line 247)

```ts
const keepRewardPool = action === 'PWP' || action === 'GIFT';
```

- [ ] Include the register-fee action, which carries goods code `11755` in its reward pool.

Without this the pool is stripped on save and the promotion is stored with **no SKU** — no error, nothing
in the UI, and it only shows up as a promotion that does nothing at the till.

This has happened once already on this seam: the form still sends `source`, the deployed API's
`CreatePromotionRequest` has no such member, and every promotion created since 2026-05-13 has a NULL
`source` with nobody noticing.

---

## Subtask 4 — Validation

**File:** `src/app/pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema.ts`

- [ ] Extend the `minLength(_path.rewardPool, 1)` rule in `promotionBenefitSchema` (currently
      `action === 'PWP' || action === 'GIFT'`) to the register-fee action.
- [ ] The cheapest action needs **no** reward pool — leave it out of that rule.

---

## Subtask 5 — Register-fee reward pool is exactly one SKU

**Files:** `promotion-form` / `promotion-gift` reward-pool section

- [ ] Constrain the register-fee pool to a single product, prefilled with `11755`.

A multi-SKU pool is meaningless here — you cannot register a customer twice, and the POS grants once per
bill regardless of what the pool holds.

---

## Subtask 6 — Cheapest action: tier wording, no pool

**Files:** `benefit-select` / `benefit-tier`, `create-promotion.ts`

- [ ] Label the tier reward as a **count** for this action — "จำนวนชิ้นที่ได้ฟรี" — not an amount.
      Threshold stays "จำนวน SET (ชุด)".
- [ ] Hide the reward-pool section for it.
- [ ] *Optional:* flip the `create-group` default from `isRepeat: true` to `false`.

**The ladder itself already works — do not build anything for it.** The ใช้ซ้ำ/ทุกๆ checkbox
(`benefit-select.component.html:34`) toggles `isRepeat`, and unchecking it enables เพิ่มสิทธิประโยชน์ to add
rungs. The agreed shape is a non-repeat ladder: threshold = how many complete sets, reward = how many of
the cheapest units become free. "Any 3, cheapest free" = filter `filterValue 3` + one tier `(1 → 1)`.

⚠️ Worth telling whoever authors these: **a non-repeat ladder does not scale with the basket.** A single
rung "1 set → 1 free" gives a six-unit basket one free unit, not two. If a promotion is meant to repeat,
they add rungs or tick ใช้ซ้ำ.

---

## Subtask 7 — Specs

- [ ] Cover the payload built for each new action, especially that the reward pool **survives** save for
      the register-fee action (Subtask 3).
