# Income Entry API

Base path: `/v2/income-entries`

Income entries represent the monthly accrual amount for a contract. There can be **multiple entries per (contract, month)**: exactly one `AUTO` row (the system-calculated estimate or PROMO/BRANCH manual amount), plus zero or more correction rows that adjust it without mutating it (append-only).

`entryType` values:

| Value               | Created by                                                          | Meaning                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `AUTO`              | `POST .../order/{contractId}/{month}`, branch job, `POST .../promo` | The original monthly estimate. Exactly one per (contract, month). |
| `CN_CORRECTION`     | `POST .../order/{contractId}/cn-correction`                         | Supplier credit note for returned goods. Negative `orderAmount`.  |
| `LAG_CORRECTION`    | `POST .../order/{contractId}/lag-correction`                        | Supplier-declared late amount. Comes in a +month/−month+1 pair.   |
| `MANUAL_CORRECTION` | `POST .../correction`                                               | Manual fallback when the system can't auto-correct.               |

An entry that has been stamped to a settlement (`settlementId` is set) is considered **picked** and cannot be deleted.

`orderAmount` is signed for corrections — summing every entry (any type) for a contract+month yields the corrected net order base directly, with no separate subtraction step. This also feeds the cumulative bracket calculation for Step/Cumulative contracts: every endpoint that computes an income delta does so as `Calculate(spec, steps, cumulativeAfter) - Calculate(spec, steps, cumulativeBefore)`, where cumulative is the running sum of `orderAmount` across all prior months (any entry type).

---

## GET /v2/income-entries

List income entries. All filters are optional.

### Query parameters

| Parameter      | Type                | Required | Description                                                |
| -------------- | ------------------- | -------- | ---------------------------------------------------------- |
| `contractType` | string              | No       | `ORDER`, `BRANCH`, or `PROMO` (case-insensitive)           |
| `contractId`   | int                 | No       | Filter to a single contract                                |
| `monthFrom`    | string (yyyy-MM-dd) | No       | Inclusive lower bound on month                             |
| `monthTo`      | string (yyyy-MM-dd) | No       | Inclusive upper bound on month                             |
| `state`        | string              | No       | `open` (not yet in a settlement) or `picked`; omit for all |

### Response `200 OK`

```json
[
  {
    "id": 1,
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-01-01",
    "orderAmount": 1500000.0,
    "amount": 22500.0,
    "entryType": "AUTO",
    "note": null,
    "settlementId": null,
    "createdAt": "2026-06-04T09:00:00"
  },
  {
    "id": 7,
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-01-01",
    "orderAmount": -50000.0,
    "amount": -750.0,
    "entryType": "CN_CORRECTION",
    "note": null,
    "settlementId": null,
    "createdAt": "2026-06-10T09:00:00"
  }
]
```

### Field notes

| Field          | Description                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `orderAmount`  | Signed system order base. `null` for PROMO and BRANCH entries.                                                                           |
| `amount`       | Calculated income for ORDER/BRANCH corrections; manually set for PROMO/MANUAL.                                                           |
| `entryType`    | `AUTO`, `CN_CORRECTION`, `LAG_CORRECTION`, or `MANUAL_CORRECTION`.                                                                       |
| `note`         | Free-text remark. Only used by `MANUAL_CORRECTION` — CN/lag corrections store their detail in dedicated item tables instead (see below). |
| `settlementId` | Non-null when the entry has been picked into a settlement.                                                                               |

---

## POST /v2/income-entries/order/{contractId}/{month}

Trigger auto-creation of a monthly ORDER income entry (`entryType = AUTO`). Queries order data for the period, then computes the income as a bracket delta over the contract's cumulative order amount (not just this month's slice), so Step/Cumulative estimates stay consistent with what settlement will eventually calculate.

### Path parameters

| Parameter    | Type                | Description                            |
| ------------ | ------------------- | -------------------------------------- |
| `contractId` | int                 | Order contract ID                      |
| `month`      | string (yyyy-MM-dd) | Month to calculate (e.g. `2026-01-01`) |

### Response `201 Created`

```json
{
  "id": 3,
  "contractId": 1,
  "contractType": "ORDER",
  "month": "2026-01-01",
  "orderAmount": 1500000.0,
  "amount": 22500.0,
  "entryType": "AUTO",
  "note": null,
  "settlementId": null,
  "createdAt": "2026-06-04T09:00:00"
}
```

### Response `400 Bad Request`

Validation error (e.g. contract not found, contract has no spec).

### Response `409 Conflict`

```json
{ "error": "income entry for contract 1 month 2026-01-01 already exists" }
```

An `AUTO` entry already exists for this contract+month — at most one is allowed (enforced by a filtered unique index). Correction entries for the same month are unaffected by this constraint.

---

## POST /v2/income-entries/promo

Create a manual PROMO income entry (`entryType = AUTO`) with a fixed amount.

### Request body

```json
{
  "contractId": 5,
  "month": "2026-02-01",
  "amount": 50000.0
}
```

### Field rules

| Field        | Rule                                      |
| ------------ | ----------------------------------------- |
| `contractId` | Must reference an existing PROMO contract |
| `month`      | Must be within the contract date range    |
| `amount`     | Must be greater than zero                 |

### Response `201 Created`

```json
{
  "id": 2,
  "contractId": 5,
  "contractType": "PROMO",
  "month": "2026-02-01",
  "orderAmount": null,
  "amount": 50000.0,
  "entryType": "AUTO",
  "note": null,
  "settlementId": null,
  "createdAt": "2026-06-04T10:00:00"
}
```

### Response `400 Bad Request`

Validation error (e.g. contract does not exist or is not a PROMO contract).

### Response `409 Conflict`

```json
{ "error": "income entry for contract 5 month 2026-02-01 already exists" }
```

---

## POST /v2/income-entries/order/{contractId}/cn-correction

Record a CN (returned-product credit note) against an already-accrued month. The supplier credits specific goods by `goodCode` — not a slice of a known order — so the request takes a list of `goodCode`/`amount` lines; only the **summed** amount drives the math, the lines themselves are best-effort traceability.

Creates a single `CN_CORRECTION` entry with `orderAmount = -Σ items.amount`, and `amount` computed as the bracket delta of removing that total from the contract's cumulative order base (same shape as the settlement calculation). The item lines are stored in a child table for audit purposes only — never read by the income calculation.

### Path parameters

| Parameter    | Type | Description       |
| ------------ | ---- | ----------------- |
| `contractId` | int  | Order contract ID |

### Request body

```json
{
  "contractId": 1,
  "month": "2026-01-01",
  "items": [
    { "goodCode": "A001", "amount": 30000.0 },
    { "goodCode": "A002", "amount": 20000.0 }
  ],
  "note": "Returned goods Jan"
}
```

### Field rules

| Field            | Rule                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| `items`          | At least one line required                                                  |
| `items[].amount` | Must be greater than zero                                                   |
| `month`          | An `AUTO` entry must already exist for this contract+month ("accrue first") |

### Response `201 Created`

```json
{
  "id": 7,
  "contractId": 1,
  "contractType": "ORDER",
  "month": "2026-01-01",
  "orderAmount": -50000.0,
  "amount": -750.0,
  "entryType": "CN_CORRECTION",
  "note": "Returned goods Jan",
  "settlementId": null,
  "createdAt": "2026-06-10T09:00:00"
}
```

### Response `400 Bad Request`

```json
{ "error": "no income entry exists for contract 1 month 2026-01-01 — accrue first" }
```

---

## GET /v2/income-entries/{id}/cn-items

Get the audit-only product-line detail for a `CN_CORRECTION` entry.

### Response `200 OK`

```json
[
  { "id": 1, "goodCode": "A001", "amount": 30000.0 },
  { "id": 2, "goodCode": "A002", "amount": 20000.0 }
]
```

### Response `404 Not Found`

Entry does not exist.

---

## POST /v2/income-entries/order/{contractId}/lag-correction

Record a supplier-declared order amount missed by the system before a month's settlement is posted. Inserts a **pair** of entries: `+amount` in `month` (counts toward `month`'s settlement now) and `-amount` in `month + 1` (so it isn't double-counted once the system's own order data catches up). Both entries get the same bracket-delta income treatment as CN correction; the `month+1` entry's delta is the exact negative of `month`'s, so the net effect across the two months is zero once both are applied.

Items are order-number lines, same best-effort-traceability shape as CN's `goodCode` lines — only the summed amount drives the math. The `month+1` entry stores its own copy of the item lines with negated amounts, so each row's audit trail is self-contained.

### Path parameters

| Parameter    | Type | Description       |
| ------------ | ---- | ----------------- |
| `contractId` | int  | Order contract ID |

### Request body

```json
{
  "contractId": 1,
  "month": "2026-01-01",
  "items": [{ "orderNumb": "PO-2026-099", "amount": 40000.0 }]
}
```

### Field rules

| Field            | Rule                                      |
| ---------------- | ----------------------------------------- |
| `items`          | At least one line required                |
| `items[].amount` | Must be greater than zero                 |
| `contractId`     | Must reference an existing ORDER contract |

### Response `201 Created`

```json
{
  "monthEntry": {
    "id": 10,
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-01-01",
    "orderAmount": 40000.0,
    "amount": 600.0,
    "entryType": "LAG_CORRECTION",
    "note": null,
    "settlementId": null,
    "createdAt": "2026-06-10T09:00:00"
  },
  "nextMonthEntry": {
    "id": 11,
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-02-01",
    "orderAmount": -40000.0,
    "amount": -600.0,
    "entryType": "LAG_CORRECTION",
    "note": null,
    "settlementId": null,
    "createdAt": "2026-06-10T09:00:00"
  }
}
```

### Response `400 Bad Request`

```json
{ "error": "order contract 1 not found" }
```

---

## GET /v2/income-entries/{id}/lag-items

Get the audit-only order-line detail for a `LAG_CORRECTION` entry.

### Response `200 OK`

```json
[{ "id": 1, "orderNumb": "PO-2026-099", "amount": 40000.0 }]
```

### Response `404 Not Found`

Entry does not exist.

---

## POST /v2/income-entries/correction

Manual fallback correction for cases the system can't auto-correct. No item detail table — `note` is free text.

For `ORDER` contracts, the caller supplies only the signed `orderAmount` delta; the income
`amount` is computed server-side using the same cumulative bracket-delta math as
settlement/CN correction (`GetCumulativeOrderAmountBeforeAsync` + `StepCalculator`). For
`BRANCH`/`PROMO` contracts (no order-based calc spec), the caller supplies `amount` directly.

### Request body (ORDER)

```json
{
  "contractId": 1,
  "contractType": "ORDER",
  "month": "2026-01-01",
  "orderAmount": -10000.0,
  "note": "supplier correction for miscounted return"
}
```

### Request body (BRANCH / PROMO)

```json
{
  "contractId": 1,
  "contractType": "PROMO",
  "month": "2026-01-01",
  "amount": -150.0,
  "note": "supplier correction for miscounted return"
}
```

### Field rules

| Field          | Rule                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| `contractType` | `ORDER`, `BRANCH`, or `PROMO`                                                    |
| `orderAmount`  | Required (signed) for `ORDER`; ignored for `BRANCH`/`PROMO`                      |
| `amount`       | Ignored for `ORDER` (computed from `orderAmount`); required for `BRANCH`/`PROMO` |
| `note`         | Optional free text, stored as-is                                                 |

### Response `201 Created`

```json
{
  "id": 12,
  "contractId": 1,
  "contractType": "ORDER",
  "month": "2026-01-01",
  "orderAmount": -10000.0,
  "amount": -150.0,
  "entryType": "MANUAL_CORRECTION",
  "note": "supplier correction for miscounted return",
  "settlementId": null,
  "createdAt": "2026-06-10T09:00:00"
}
```

---

## DELETE /v2/income-entries/{id}

Delete an income entry. Only open entries (not yet picked into a settlement) can be deleted. Deleting a `CN_CORRECTION` or `LAG_CORRECTION` entry also deletes its associated item-detail rows in the same transaction.

### Path parameters

| Parameter | Type | Description     |
| --------- | ---- | --------------- |
| `id`      | int  | Income entry ID |

### Response `204 No Content`

### Response `404 Not Found`

### Response `409 Conflict`

```json
{ "error": "cannot delete a picked entry" }
```
