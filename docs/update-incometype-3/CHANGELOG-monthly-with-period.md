# API Change: Add Monthly Income + Period in One Request

## Background

Previously, creating a monthly income record and a period required two separate API calls:
1. `POST /monthly-income/{id}/add-income` — create the monthly income record
2. `POST /period/{headId}/create` — create a period and link the monthly record to it

For cases where a monthly income record and a period are always 1-to-1, you can now do both in a single request.

> **This endpoint is only for non-NotLight event types** (i.e. `eventType = 2` or `3`).
> For `eventType = 1` (NotLight / ORDER_PRODUCT), continue using the original two-step flow — receipt items need to be submitted with the monthly record separately.

---

## New Endpoint

### `POST /monthly-income/{id}/add-income-with-period`

Creates a monthly income record and a period record atomically (single transaction). The monthly record is automatically linked to the new period.

**URL param**

| Param | Type | Description |
|-------|------|-------------|
| `id`  | int  | `other_income_heads.id` (head ID) |

---

**Request body**

```json
{
  "eventType": 2,
  "cn": 0,
  "calAmount": 1000.00,
  "actualAmount": 1000.00,
  "incomeAmount": 1000.00,
  "reason": "March banner",
  "startDate": "2026-03-01T00:00:00",

  "periodName": "March 2026",
  "periodRemark": "",
  "totalAmount": 1000.00,
  "totalIncome": 1000.00
}
```

**Field reference**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventType` | int | yes | `2` = Light (PROMO_BANNER), `3` = Ince/Salesman. **Do NOT send `1` (NotLight)** — server will reject it |
| `cn` | decimal | yes | CN adjustment value |
| `calAmount` | decimal | yes | Calculated amount before adjustment |
| `actualAmount` | decimal | yes | Actual amount to accumulate on head |
| `incomeAmount` | decimal | yes | Income amount to accumulate on head |
| `reason` | string | no | Free-text remark |
| `startDate` | datetime | yes | Month start date (e.g. first day of the month) |
| `periodName` | string | no | Display name for the period |
| `periodRemark` | string | no | Remark for the period |
| `totalAmount` | decimal | yes | Total amount for the period record |
| `totalIncome` | decimal | yes | Total income for the period record |

> `endDate` of both the monthly record and the period is auto-set to end-of-month from `startDate` by the server.
> There is no `receList` field on this endpoint.

---

**Response `200 OK`**

```json
{
  "monthlyId": 42,
  "periodId": 17
}
```

| Field | Description |
|-------|-------------|
| `monthlyId` | ID of the new `other_income_lists` record |
| `periodId` | ID of the new `other_income_periods` record |

**Error** — if `eventType = 1` (NotLight) is sent, the server returns an error. Use the original two-step flow instead.

---

## What the server does (for reference)

1. Rejects the request if `eventType = 1` (NotLight)
2. Adds `actualAmount` and `incomeAmount` to `other_income_heads.acc_amount` / `acc_income`
3. Inserts a row into `other_income_lists`
4. Inserts a row into `other_income_periods`
5. Sets `other_income_lists.check_date = now` and links `period_id` to the new period

All steps run in a single transaction — if anything fails, nothing is saved.

---

## When to use which endpoint

| Event type | Endpoint |
|------------|----------|
| `1` NotLight (ORDER_PRODUCT) | `POST /monthly-income/{id}/add-income` then `POST /period/{headId}/create` |
| `2` Light (PROMO_BANNER) | `POST /monthly-income/{id}/add-income-with-period` ← new |
| `3` Ince / Salesman | `POST /monthly-income/{id}/add-income-with-period` ← new |
