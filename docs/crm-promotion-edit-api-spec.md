# API Spec — Update Promotion

## Endpoint

```
PUT /crm/promotions/:id
```

## Request

**Path param**

| Param | Type     | Description                   |
| ----- | -------- | ----------------------------- |
| `id`  | `number` | ID of the promotion to update |

**Body** — same shape as the create endpoint (`TCreatePromotionRequest`)

```jsonc
{
  "promotionName": "string", // required, trimmed
  "promotionDesc": "string", // optional, trimmed
  "promotionType": "BILL | BUNDLE | ITEM",
  "source": "HU | SUPPLIER | BOTH", // required
  "promotionOrder": 0, // 0–3; must be 0 when source = "HU"
  "promotionPriority": 0, // 0–3
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "isBranchSpecific": false,
  "branches": ["string"], // branchCode[]; non-empty when isBranchSpecific = true
  "isMemberSpecific": false,
  "members": [0], // member id[]; non-empty when isMemberSpecific = true
  "limitTime": false,
  "startTime": "HH:MM:SS",
  "endTime": "HH:MM:SS",
  "activeDay": "1111111", // 7-char binary string (Sun–Sat)
  "filterList": [
    {
      "filterType": "COUNT | SUBTOTAL | EXIST",
      "filterValue": 0, // must be >= 1 unless filterType = EXIST
      "productList": ["goodCode"], // string[]; non-empty
    },
  ],
  "action": "BILLBATHDISC | BILLPERCENTDISC | BUNDLEBATHDISC | BUNDLEPERCENTDISC | ITEMPERCENTDISC | ITEMBATHDISC | PWP | GIFT",
  "thresholdType": "BILLSUBTOTAL | BILLCOUNT | BUNDLECOUNT | BUNDLESUBTOTAL | ITEMEXIST",
  "isRepeat": false,
  "tiers": [{ "thresholdValue": 0, "rewardValue": 0 }],
  "rewardPool": [
    {
      "goodCode": "string",
      "itemBenefitType": "PRICE | BATHDISC | PERCENTDISC",
      "itemBenefitValue": 0,
    },
  ],
}
```

## Response

| Status            | Body                  | Meaning             |
| ----------------- | --------------------- | ------------------- |
| `200 OK`          | `{ message: 'ok'}`    | Update succeeded    |
| `400 Bad Request` | `{ message: string }` | Validation error    |
| `404 Not Found`   | `{ message: string }` | Promotion not found |

## Business rules (same as create)

- `source` is required and must be one of `HU | SUPPLIER | BOTH`
- `promotionOrder` must be `0` when `source = HU`
- `endDate >= startDate`
- When `limitTime = true`: `endTime > startTime`, neither can be `00:00`
- `activeDay` must have at least one `'1'`
- `tiers` must have at least 1 entry; when `isRepeat = true` exactly 1 entry
- Tier `thresholdValue` and `rewardValue` must be distinct across the array
- When `action` includes `"PERCENT"`: `rewardValue` in `[0, 100]`
- When `action = PWP | GIFT`: `rewardPool` must have at least 1 item
- When `promotionType != BILL`: `filterList` must have at least 1 group
- All `filterType` values within `filterList` must be identical
- No product (`goodCode`) may appear in more than one filter group
- When `thresholdType = BUNDLESUBTOTAL` ("spend N baht on these goods"): `promotionType` must be
  `BUNDLE`; `action` one of `BUNDLEBATHDISC | BUNDLEPERCENTDISC | PWP | GIFT`; `filterList` exactly
  one group with `filterType = EXIST`; every tier `thresholdValue > 0` (baht). The baht lives on
  the tiers, never in `filterValue` — the till reads that as a unit count.

## Not yet enforced by the API

As of 2026-09-20 the API does **not** validate the promotion body against the
rules below — the Angular client is the only guard. They are enforced in
`createPromotionSchema.ts` (see `THRESHOLD_RULES`, `POOL_ONLY_ACTIONS` and
`PRICE_ACTIONS` in `src/app/lib/crm-promotion/promotion-actions.ts`) and are
listed here as the spec for the backend work that should follow. Anything
reaching the API by another route — a direct call, a script, an older client —
currently bypasses all of it.

### Threshold floor depends on `thresholdType`

`thresholdValue` has no single valid minimum; it depends on what the threshold
counts. A `0` on a COUNT type is satisfied by an empty basket, and on a
repeating tier that is satisfied without bound — it reaches the till as an
unbounded discount. This was a live authoring bug: `BUNDLECOUNT` accepted `0`.

| `thresholdType` | Unit | Min | Integer |
| --------------- | ---- | --- | ------- |
| `BILLSUBTOTAL`  | baht | `0` (means "no minimum") | no |
| `BILLCOUNT`     | pieces | `1` | yes |
| `BUNDLECOUNT`   | sets | `1` | yes |
| `BUNDLESUBTOTAL` | baht of the group's goods | `1` (API enforces `> 0`) | no |
| `ITEMEXIST`     | —    | `0` (not authored) | yes |

Additionally: when `isRepeat = true`, every tier needs `thresholdValue > 0`.
This is the compound case — it catches `BILLSUBTOTAL`, where `0` is otherwise
legal but divides into the basket infinitely often.

### Reward floor depends on `action`

| Action group | Min | Notes |
| ------------ | --- | ----- |
| `*BATHDISC`, `*PERCENTDISC` | `> 0` | a 0 deduction is a promotion that does nothing |
| `BUNDLEPRICE`, `ITEMPRICE`  | `>= 0` | absolute price; `0` means free, which is valid |
| `CHEAPEST`                  | `>= 1`, integer | a count of free units |
| `PWP`, `GIFT`               | not applicable | benefit lives in `rewardPool`; the tier value is meaningless and must not be required |
| `REGISTERFEE`               | always `0` | benefit is the free SKU, not an amount |

### Tier ladder ordering

Distinctness alone permits `(100 -> 50฿)`, `(200 -> 10฿)`: spend more, get
less. Sorted by ascending `thresholdValue`, `rewardValue` must be
non-decreasing. Skipped for `PRICE` actions (a higher threshold should set a
*lower* price) and for `PWP`/`GIFT`.

### `rewardPool` item values

`itemBenefitValue` needs `>= 0`, and `<= 100` when
`itemBenefitType = PERCENTDISC`. Note the pool's benefit type is its own enum
(`PRICE | BATHDISC | PERCENTDISC`) and is **not** the promotion-level `action`,
so an `action`-based percent cap does not cover it — a `PWP` item at 250%
previously validated clean on both sides.

### Action enum is stale above

The `action` enum in the body sample predates `REGISTERFEE` and `CHEAPEST`.
Both are live. See the suffix-routing warning at the top of
`src/app/lib/crm-promotion/promotion-actions.ts` before adding another: DrugPos
routes actions by `EndsWith` on `GIFT`, `PWP`, `PERCENTDISC`, `BATHDISC` and
`PRICE`, so a new name ending in one of those is silently handled as that other
action.

### Still unenforced on both sides

- `action` is not checked for consistency with `promotionType` (a `BILL*` action
  on a `BUNDLE` promotion is unrepresentable in the UI but not rejected)
- `action` is not checked for consistency with `thresholdType`
- `promotionOrder` / `promotionPriority` range (`0–3`) is only `required`
  client-side, not range-checked
