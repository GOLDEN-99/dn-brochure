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
  "thresholdType": "BILLSUBTOTAL | BILLCOUNT | BUNDLECOUNT | ITEMEXIST",
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
