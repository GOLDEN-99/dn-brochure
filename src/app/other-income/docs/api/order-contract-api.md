# Order Contract API

Base path: `/v2/order-contracts`

Order contracts cover DC and Rebate income. Each contract has one spec (calc type + exclude flags) and one or more bracket steps. Product filters restrict which order lines count toward the base amount.

---

## GET /v2/order-contracts

List all order contracts. Optionally filter by supplier.

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
    "contractLabelId": 1,
    "contractLabelName": "DC Support",
    "settlementPeriod": 3,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "supplierPairId": null,
    "createdAt": "2026-06-04T09:00:00"
  }
]
```

`compName` is `null` when the referenced company can't be found (e.g. inactive/removed) — it comes from a `LEFT JOIN` against `CompInfo`/`DNCompInfo`. `contractLabelName` is always present.

---

## GET /v2/order-contracts/{id}

Get a single contract with its spec, steps, product filters, and income types. Unlike the list endpoint, this enriches raw codes with display names looked up from master data (`CompInfo`/`DNCompInfo`, `other_income_contract_labels`, `GoodInfo`, `other_income_income_labels`).

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
  "contractLabelId": 1,
  "contractLabelName": "DC Support",
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "supplierPairId": null,
  "createdAt": "2026-06-04T09:00:00",
  "spec": {
    "id": 1,
    "calcType": "Step",
    "capAmount": 5000000.0,
    "excludeVat": true,
    "excludeDc": false,
    "excludeRebate": false,
    "excludeInce": false,
    "excludeComp": false
  },
  "steps": [
    { "id": 1, "min": 0.0, "max": 1000000.0, "rate": 2 },
    { "id": 2, "min": 1000000.0, "max": 3000000.0, "rate": 3 },
    { "id": 3, "min": 3000000.0, "max": null, "rate": 5 }
  ],
  "products": [
    { "goodCode": "A001", "goodName": "Paracetamol 500mg", "barCode": "8850001234567" },
    { "goodCode": "A002", "goodName": "Amoxicillin 250mg", "barCode": null }
  ],
  "incomeTypes": [
    {
      "id": 1,
      "contractId": 1,
      "contractType": "ORDER",
      "incomeType": "Invoice",
      "incomeLabelId": 2,
      "incomeLabelName": "Standard Invoice",
      "createdAt": "2026-06-04T09:00:00"
    },
    {
      "id": 2,
      "contractId": 1,
      "contractType": "ORDER",
      "incomeType": "Bill",
      "incomeLabelId": null,
      "incomeLabelName": null,
      "createdAt": "2026-06-04T09:00:00"
    }
  ]
}
```

`compName` and `products[].goodName`/`barCode` are `null` when the referenced master-data row can't be found (e.g. inactive/removed company or product) — these come from `LEFT JOIN`s against `CompInfo`/`DNCompInfo` and `GoodInfo`, tables this API doesn't own.

`incomeTypes` mirrors [`GET /v2/contracts/ORDER/{id}/income-types`](contract-income-type-api.md) — same rows, same shape. `incomeLabelName` is `null` when `incomeLabelId` is `null` (most `incomeType` values don't require a label).

`contractLabelName` is always present — `contract_label_id` has a foreign key into `other_income_contract_labels`, so the label is guaranteed to exist.

### Response `404 Not Found`

Contract does not exist.

---

## POST /v2/order-contracts

Create a new order contract together with its spec, steps, and product filters in one atomic transaction.

### Request body

```json
{
  "compCode": "10001",
  "compType": "DN",
  "contractLabelId": 1,
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "supplierPairId": null,
  "spec": {
    "calcType": "Step",
    "capAmount": 5000000.0,
    "excludeVat": true,
    "excludeDc": false,
    "excludeRebate": false,
    "excludeInce": false,
    "excludeComp": false
  },
  "steps": [
    { "min": 0.0, "max": 1000000.0, "rate": 2 },
    { "min": 1000000.0, "max": 3000000.0, "rate": 3 },
    { "min": 3000000.0, "max": null, "rate": 5 }
  ],
  "productGoodCodes": ["A001", "A002"],
  "incomeTypes": [
    { "incomeType": "Bill", "incomeLabelId": null },
    { "incomeType": "Invoice", "incomeLabelId": 2 }
  ]
}
```

### Field rules

| Field              | Rule                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `compType`         | Must be `DN` or `HU`                                                                                                    |
| `settlementPeriod` | Must be `1`, `3`, `6`, or `12`                                                                                          |
| `endDate`          | Must be after `startDate`                                                                                               |
| `spec.calcType`    | `Flat`, `Step`, or `Cumulative`                                                                                         |
| `steps`            | Exactly 1 step when `calcType = Flat`; at least 1 when `Step` or `Cumulative`                                           |
| `steps[].max`      | `null` = open upper bound (last bracket only)                                                                           |
| `productGoodCodes` | Empty list = all products included                                                                                      |
| `incomeTypes`      | At least 1 required. Each `incomeType` may appear at most once. `incomeLabelId` is required when `incomeType = Invoice` |

Income types are inserted into `other_income_contract_income_types` in the same transaction as the contract, spec, steps, and product filters. Additional income types can be added later via the [Contract Income Type API](contract-income-type-api.md).

### `calcType` behaviour

| calcType     | Income calculation                                                       |
| ------------ | ------------------------------------------------------------------------ |
| `Flat`       | `orderAmount × steps[0].rate / 100`                                            |
| `Step`       | Each bracket slice multiplied by its rate, divided by 100, summed                        |
| `Cumulative` | Entire `orderAmount` multiplied by the rate of the bracket it falls into, divided by 100 |

`rate` is a whole-number percent (e.g. `5` means 5%), matching v1 storage — not a fraction.

`capAmount` caps `orderAmount` before the calculation. `null` = no cap.

### Response `201 Created`

```json
{ "id": 1 }
```

**Retrospective back-fill:** After the contract is saved, the server fires a background task that creates accrual entries for every month from `startDate` up to and including the **last completed month** (current month − 1). The in-progress current month is excluded — it has no complete receive data yet. This runs asynchronously — the `201` response is returned immediately without waiting for the back-fill to complete. Duplicate months are silently skipped (idempotent). Back-fill failures are logged as warnings on the server but do not affect the HTTP response.

### Response `400 Bad Request`

```json
{ "error": "settlement_period must be 1, 3, 6, or 12" }
```

Other possible errors: `"At least one income type is required"`, `"income_label_id is required when income_type is Invoice"`, `"income_type Bill can only appear once per contract"`.

---

## PUT /v2/order-contracts/{id}

Update contract header fields. Does not touch spec or steps.

### Request body

```json
{
  "contractLabelId": 1,
  "settlementPeriod": 6,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "supplierPairId": null
}
```

### Response `204 No Content`

### Response `404 Not Found`

---

## PUT /v2/order-contracts/{id}/spec

Replace the spec and all bracket steps atomically. Old steps are deleted and new steps are inserted in the same transaction.

### Request body

```json
{
  "calcType": "Cumulative",
  "capAmount": null,
  "excludeVat": true,
  "excludeDc": false,
  "excludeRebate": false,
  "excludeInce": false,
  "excludeComp": false,
  "steps": [
    { "min": 0.0, "max": 2000000.0, "rate": 3 },
    { "min": 2000000.0, "max": null, "rate": 5 }
  ]
}
```

### Response `204 No Content`

### Response `400 Bad Request`

```json
{ "error": "Step and Cumulative calc_type require at least one step" }
```

### Response `404 Not Found`

---

## POST /v2/order-contracts/{id}/products

Add a product filter. Only order lines for this product code will count toward the order base.

### Request body

```json
{ "goodCode": "A003" }
```

### Response `201 Created`

```json
{ "goodCode": "A003" }
```

### Response `404 Not Found`

---

## DELETE /v2/order-contracts/{id}/products/{goodCode}

Remove a product filter.

### Path parameters

| Parameter  | Type   | Description            |
| ---------- | ------ | ---------------------- |
| `id`       | int    | Contract ID            |
| `goodCode` | string | Product code to remove |

### Response `204 No Content`

### Response `404 Not Found`

---

## GET /v2/order-contracts/{id}/orders

Search the supplier's live order history for this contract — used to look up real order numbers/amounts when filling in a [lag correction](income-entry-api.md#post-v2income-entriesordercontractidlag-correction) request. Resolves the contract's `compCode`/`compType` and queries `HistStockOrder` (HU) or `HistStockDNOrder` (DN) directly — not `other_income_*` tables.

### Path parameters

| Parameter | Type | Description |
| --------- | ---- | ------------ |
| `id`      | int  | Contract ID  |

### Query parameters

| Parameter   | Type   | Required | Description                                                  |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| `orderNumb` | string | **Yes**  | Substring match against the order number (`LIKE '%term%'`)      |

### Response `200 OK`

```json
[
  {
    "orderNumb": "PO-2026-099",
    "allTotal": 42000.0,
    "vat": 2746.0,
    "includeVat": false
  }
]
```

Filtered to the contract's `compCode` and `orderStat NOT IN ('0', '4')` (excludes Cancelled and Closed orders).

### Response `400 Bad Request`

```json
{ "error": "orderNumb is required" }
```

### Response `404 Not Found`

Contract does not exist.

---

## Accrual Calculation Design

This section documents the decisions behind how monthly accrual entries are calculated for order contracts.

### Order amount source

Order amount is derived from goods **received** (not ordered), using `receDate` as the basis. Tables used:

- `HistStockRece` — receipt header, provides `receDate`, `compCode`, discount columns
- `StockReceList` — receipt line items, provides `subtotal` per product
- `HistStockOrder` — order header, provides `includeVAT` flag

Only lines where `srl.goodCode` matches the contract's product filter are included. An empty product filter means all products are included.

Spec exclude flags (`excludeVat`, `excludeDc`, `excludeRebate`, `excludeInce`, `excludeComp`) are applied to adjust the base amount before calculation.

**Why `receDate` and not `billDate`:** Accounting wants to estimate income based on what was physically received each month. `billDate` reflects when the order was placed, which may be a prior month. Estimates use `receDate`; actual income is recalculated and corrected just before settlement is posted.

### Delta calculation (all CalcTypes)

A single month's receive amount does not indicate which bracket the contract is currently in. The bracket is determined by cumulative volume since `startDate`. Therefore the monthly income is always calculated as a delta:

```
cumulativeM   = sum of order amount from startDate to end of month M
cumulativeM1  = sum of order amount from startDate to end of month M-1

income = Calculate(spec, steps, cumulativeM) - Calculate(spec, steps, cumulativeM1)
```

This applies to all three `calcType` values (`Flat`, `Step`, `Cumulative`). For `Flat` the delta is mathematically equivalent to applying the rate to the month slice directly, but the same formula is used for all types to keep the logic uniform.

### What is stored per entry

| Column         | Value stored                                     |
| -------------- | ------------------------------------------------ |
| `order_amount` | `cumulativeM - cumulativeM1` (in-month slice)    |
| `amount`       | Income delta: `f(cumulativeM) - f(cumulativeM1)` |

`order_amount` stores the in-month receive slice because that is what accounting reviews. The cumulative total is not stored — it can be reconstructed by summing all `order_amount` entries up to any given month.

### Monthly job timing

The cron job runs on the **1st of each month** (`0 1 1 * *`) and inserts the accrual for the **previous month** (the last completed month). The in-progress current month is never inserted by the job.

The same rule applies to retrospective back-fill on contract creation: the loop runs from `startDate`'s month up to and including `currentMonth - 1`.
