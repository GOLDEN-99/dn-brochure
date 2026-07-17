# Promo Contract API

Base path: `/v2/promo-contracts`

Promo contracts cover salesman and product-push promotion income. No spec or calculation parameters — income entries are created manually by purchasing.

---

## GET /v2/promo-contracts

List all promo contracts. Optionally filter by supplier.

### Query parameters

| Parameter  | Type   | Required | Description           |
| ---------- | ------ | -------- | --------------------- |
| `compCode` | string | No       | Supplier company code |
| `compType` | string | No       | `DN` or `HU`          |

### Response `200 OK`

```json
[
  {
    "id": 1,
    "compCode": "10001",
    "compName": "ACME Trading Co., Ltd.",
    "compType": "DN",
    "contractLabelId": 3,
    "contractLabelName": "Salesman Promotion",
    "settlementPeriod": 3,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "createdAt": "2026-06-05T09:00:00"
  }
]
```

`compName` is `null` when the referenced company can't be found (e.g. inactive/removed) — it comes from a `LEFT JOIN` against `CompInfo`/`DNCompInfo`. `contractLabelName` is always present.

---

## GET /v2/promo-contracts/{id}

Get a single promo contract with its income types. Unlike the list endpoint, this enriches raw codes with display names looked up from master data (`CompInfo`/`DNCompInfo`, `other_income_contract_labels`, `other_income_income_labels`).

### Path parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | int  | Contract ID |

### Response `200 OK`

```json
{
  "id": 1,
  "compCode": "10001",
  "compName": "ACME Trading Co., Ltd.",
  "compType": "DN",
  "contractLabelId": 3,
  "contractLabelName": "Salesman Promotion",
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "createdAt": "2026-06-05T09:00:00",
  "incomeTypes": [
    {
      "id": 1,
      "contractId": 1,
      "contractType": "PROMO",
      "incomeType": "FreeItem",
      "incomeLabelId": null,
      "incomeLabelName": null,
      "createdAt": "2026-06-05T09:00:00"
    }
  ]
}
```

`incomeTypes` mirrors [`GET /v2/contracts/PROMO/{id}/income-types`](contract-income-type-api.md) — same rows, same shape.

`compName` is `null` when the referenced company can't be found (e.g. inactive/removed) — it comes from a `LEFT JOIN` against `CompInfo`/`DNCompInfo`, a table this API doesn't own.

`contractLabelName` is always present — `contract_label_id` has a foreign key into `other_income_contract_labels`, so the label is guaranteed to exist.

### Response `404 Not Found`

---

## POST /v2/promo-contracts

Create a new promo contract.

### Request body

```json
{
  "compCode": "10001",
  "compType": "DN",
  "contractLabelId": 3,
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### Field rules

| Field              | Rule                           |
| ------------------ | ------------------------------ |
| `compType`         | Must be `DN` or `HU`           |
| `settlementPeriod` | Must be `1`, `3`, `6`, or `12` |
| `endDate`          | Must be after `startDate`      |

### Response `201 Created`

```json
{ "id": 1 }
```

### Response `400 Bad Request`

```json
{ "error": "settlement_period must be 1, 3, 6, or 12" }
```

---

## PUT /v2/promo-contracts/{id}

Update contract header fields.

### Request body

```json
{
  "contractLabelId": 3,
  "settlementPeriod": 6,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### Field rules

| Field              | Rule                           |
| ------------------ | ------------------------------ |
| `settlementPeriod` | Must be `1`, `3`, `6`, or `12` |
| `endDate`          | Must be after `startDate`      |

### Response `204 No Content`

### Response `400 Bad Request`

```json
{ "error": "end_date must be after start_date" }
```

### Response `404 Not Found`
