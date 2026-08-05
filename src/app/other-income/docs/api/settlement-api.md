# Settlement API

Base path: `/v2/settlements`

A settlement locks a set of income entries for a contract period and records the three-number comparison: system-estimated income vs. supplier-confirmed income. Creating a settlement stamps (`picks`) all referenced income entries so they cannot be deleted.

CN orders are not a separate concept here — a CN is just a `CN_CORRECTION` income entry (see the [Income Entry API](income-entry-api.md)). Picking its entry ID into `incomeEntryIds` is enough to settle it; there is no separate CN ID list. Corrections carry a signed `orderAmount`, so summing every picked entry already nets CN/lag/manual adjustments against the `AUTO` estimate.

## State model

Settlements carry two **independent** state dimensions — do not conflate them:

- **`balanceState`** — computed, not stored. `OUTSTANDING` if
  `supplierIncome - (Σ invoice + Σ creditNote + Σ billDiscount + Σ freeItem) > 1`,
  else `SETTLED`. Sums all four appended-document types jointly against a
  single `supplierIncome` threshold — a settlement isn't restricted to one
  income type. `> 1` / `<= 1` matches the existing rounding-tolerance
  convention used for invoice-receipt matching.
- **`reviewState`** — a workflow flag, not derived from amounts.
  `UNREVIEWED` by default; `REVIEWED` once accounting explicitly confirms
  the appended documents against what the supplier actually sent (`POST
  /v2/settlements/{id}/review`). A settlement can be `SETTLED` +
  `UNREVIEWED` (the common case right after the last document is posted) —
  the two states move independently and neither blocks the other.

Invoices additionally carry their own **`invoiceState`** (`UNMATCHED` /
`MATCHED`), tracked per invoice row rather than per settlement, since
invoice→receipt matching has its own remediation workflow (chasing the
receipt) — see `GET /v2/settlements/invoice-states` below.

---

## GET /v2/settlements

List settlements. All filters are optional.

### Query parameters

| Parameter      | Type   | Required | Description                               |
| -------------- | ------ | -------- | ----------------------------------------- |
| `contractType` | string | No       | `ORDER`, `BRANCH`, or `PROMO`             |
| `contractId`   | int    | No       | Filter to a single contract               |

### Response `200 OK`

```json
[
  {
    "id": 1,
    "contractId": 1,
    "contractType": "ORDER",
    "periodName": "Q1-2026",
    "startDate": "2026-01-01",
    "endDate": "2026-03-31",
    "systemOrderAmount": 4500000.0,
    "cnOrderAmount": 50000.0,
    "systemIncome": 67500.0,
    "supplierOrderAmount": 4400000.0,
    "supplierIncome": 66000.0,
    "cumulativeOrderAtClose": null,
    "remark": null,
    "createdAt": "2026-04-05T10:00:00"
  }
]
```

---

## GET /v2/settlements/{id}

Get a single settlement with all supporting documents.

### Path parameters

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `id`      | int  | Settlement ID  |

### Response `200 OK`

```json
{
  "id": 1,
  "contractId": 1,
  "contractType": "ORDER",
  "periodName": "Q1-2026",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "systemOrderAmount": 4500000.0,
  "cnOrderAmount": 50000.0,
  "systemIncome": 67500.0,
  "supplierOrderAmount": 4400000.0,
  "supplierIncome": 66000.0,
  "cumulativeOrderAtClose": null,
  "remark": null,
  "createdAt": "2026-04-05T10:00:00",
  "billDiscounts": [],
  "freeItems": [],
  "invoices": [
    { "id": 1, "invoiceNumb": "INV-001", "invoiceAmount": 66000.0, "invoiceDate": "2026-04-01", "invoiceRemark": null, "createdAt": "2026-04-05T10:00:00" }
  ],
  "receipts": [
    { "id": 1, "receNumb": "REC-001", "receAmount": 66000.0, "receDate": "2026-04-10", "receRemark": null, "createdAt": "2026-04-05T10:00:00" }
  ],
  "invoiceReceiptMatches": [
    { "id": 1, "invoiceId": 1, "receiptId": 1, "matchedAmount": 66000.0, "createdAt": "2026-04-05T10:00:00" }
  ],
  "creditNotes": []
}
```

### Field notes

| Field                  | Description                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `systemOrderAmount`    | Sum of (signed) `orderAmount` across all picked income entries — AUTO and corrections together (ORDER only). |
| `cnOrderAmount`        | Display-only derived value: `-Σ orderAmount` of picked entries where `entryType = CN_CORRECTION` (ORDER only). Not a separate input — it's read off whichever entries were picked. |
| `systemIncome`         | Bracket-delta income: `Calculate(cumulativeAfter) - Calculate(cumulativeBefore)`, where `cumulativeAfter = cumulativeBefore + systemOrderAmount`. |
| `supplierOrderAmount`  | Supplier-confirmed order base (entered manually). `null` for BRANCH and PROMO contracts. |
| `supplierIncome`       | Same bracket-delta treatment as `systemIncome`, applied to `supplierOrderAmount` instead. |
| `cumulativeOrderAtClose` | Running cumulative order total at period end for Cumulative calc type. `null` otherwise.|
| `billDiscounts`        | In-kind bill discount records (used when income type is `Bill`).                         |
| `freeItems`            | Free item records (used when income type is `FreeItem`).                                 |
| `invoices`             | Invoice documents (used when income type is `Invoice`).                                  |
| `receipts`             | Receipt documents (used when income type is `Invoice`).                                  |
| `invoiceReceiptMatches`| Pairings between invoices and receipts with matched amounts.                             |
| `creditNotes`          | Credit note documents (used when income type is `CreditNote`).                           |

### Response `404 Not Found`

---

## POST /v2/settlements

Create a settlement. All referenced income entry IDs are stamped (picked) atomically — this includes `AUTO` rows and any `CN_CORRECTION`/`LAG_CORRECTION`/`MANUAL_CORRECTION` rows the caller wants to settle this period; there is no separate CN list to keep in sync.

Creation only picks income entries — it never accepts bill discounts, free items, invoices, or credit notes. Every settlement is created "bare" and all four document types are appended afterward via their respective `POST /v2/settlements/{id}/...` endpoints (see below). This keeps settlement creation to a single concern and treats appending supporting documents as the same follow-up step for every contract type, including BRANCH settlements auto-created by `AddBranchWithAccrualAsync`.

### Request body

```json
{
  "contractId": 1,
  "contractType": "ORDER",
  "periodName": "Q1-2026",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "supplierOrderAmount": 4400000.0,
  "incomeEntryIds": [1, 2, 3, 7],
  "remark": null
}
```

`incomeEntryIds` includes entry `7`, a `CN_CORRECTION` row — picking it is all that's needed to settle that CN; its (negative) `orderAmount` nets into `systemOrderAmount` automatically.

### Field rules

| Field                        | Rule                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `contractType`               | Must be `ORDER`, `BRANCH`, or `PROMO`                                                       |
| `endDate`                    | Must be on or after `startDate`                                                             |
| `supplierOrderAmount`        | Required for ORDER contracts; omit or set `null` for BRANCH and PROMO                       |
| `incomeEntryIds`             | All entries must belong to the given contract and must be open (not already picked)          |
| `systemIncome` / `supplierIncome` (BRANCH, PROMO) | Both must be greater than 0 — a BRANCH/PROMO settlement with either side at zero (or negative) is rejected. ORDER contracts have no such check: it's valid for one side to be 0 while the other is positive. |

### Response `201 Created`

Returns the settlement header (same shape as the list response, without sub-document arrays).

```json
{
  "id": 1,
  "contractId": 1,
  "contractType": "ORDER",
  "periodName": "Q1-2026",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "systemOrderAmount": 4500000.0,
  "cnOrderAmount": 50000.0,
  "systemIncome": 67500.0,
  "supplierOrderAmount": 4400000.0,
  "supplierIncome": 66000.0,
  "cumulativeOrderAtClose": null,
  "remark": null,
  "createdAt": "2026-04-05T10:00:00"
}
```

### Response `400 Bad Request`

```json
{ "error": "income entry 4 does not belong to contract 1 or is already picked" }
```

---

## POST /v2/settlements/{id}/invoices

Append invoices, receipts, and invoice-receipt matches to an existing settlement. This is the only way to add receipts/matches — they are not accepted on `POST /v2/settlements`.

### Request body

```json
{
  "invoices": [
    { "invoiceNumb": "INV-002", "invoiceAmount": 1500.0, "invoiceDate": "2026-04-02", "invoiceRemark": null }
  ],
  "receipts": [
    { "receNumb": "REC-002", "receAmount": 1500.0, "receDate": "2026-04-11", "receRemark": null }
  ],
  "invoiceReceiptMatches": [
    { "invoiceIndex": 0, "receiptIndex": 0, "matchedAmount": 1500.0 }
  ]
}
```

`invoiceReceiptMatches[].invoiceIndex`/`receiptIndex` are zero-based indices into the `invoices`/`receipts` arrays in this same request, not existing settlement row IDs.

### Field rules

| Field                                  | Rule                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `invoiceReceiptMatches[].matchedAmount` | Must be greater than 0                                                                              |
| `invoiceReceiptMatches[].invoiceIndex`  | Match cannot exceed that invoice's remaining capacity (`invoiceAmount` minus the sum of all matches already recorded against it, including matches from earlier append calls) |
| `invoiceReceiptMatches[].receiptIndex`  | Sum of matches in this request against a given receipt cannot exceed that receipt's `receAmount`   |

Matching is validated in request order inside a single transaction; the first violation aborts the whole call (no invoices, receipts, or matches are persisted).

### Response `201 Created`

```json
{
  "invoices": [ { "id": 2, "invoiceNumb": "INV-002", "invoiceAmount": 1500.0, "invoiceDate": "2026-04-02", "invoiceRemark": null, "createdAt": "2026-04-05T10:05:00" } ],
  "receipts": [ { "id": 2, "receNumb": "REC-002", "receAmount": 1500.0, "receDate": "2026-04-11", "receRemark": null, "createdAt": "2026-04-05T10:05:00" } ],
  "invoiceReceiptMatches": [ { "id": 2, "invoiceId": 2, "receiptId": 2, "matchedAmount": 1500.0, "createdAt": "2026-04-05T10:05:00" } ]
}
```

### Response `400 Bad Request`

```json
{ "error": "invoiceIndex or receiptIndex is out of range" }
```

Also returned (as an unhandled exception, same as other v2 write endpoints) when a match violates one of the field rules above, e.g. `"Invoice 2 capacity exceeded: remaining 500.0, requested 1500.0"` or `"Total matched amount 2000.0 exceeds receipt amount 1500.0"`.

### Response `404 Not Found`

---

## POST /v2/settlements/{id}/bill-discounts

Append bill discount records to an existing settlement.

### Request body

```json
{
  "billDiscounts": [
    { "orderNumb": "ORD-001", "receNumb": "REC-001", "subtotalAmount": 1000.0, "remark": null }
  ]
}
```

### Response `201 Created`

```json
{
  "billDiscounts": [ { "id": 1, "orderNumb": "ORD-001", "receNumb": "REC-001", "subtotalAmount": 1000.0, "remark": null, "createdAt": "2026-04-05T10:05:00" } ]
}
```

### Response `404 Not Found`

---

## POST /v2/settlements/{id}/free-items

Append free item records to an existing settlement.

### Request body

```json
{
  "freeItems": [
    { "orderNumb": "ORD-001", "receNumb": "REC-001", "goodCode": "G-001", "subtotalAmount": 500.0, "remark": null }
  ]
}
```

### Response `201 Created`

```json
{
  "freeItems": [ { "id": 1, "orderNumb": "ORD-001", "receNumb": "REC-001", "goodCode": "G-001", "subtotalAmount": 500.0, "remark": null, "createdAt": "2026-04-05T10:05:00" } ]
}
```

### Response `404 Not Found`

---

## POST /v2/settlements/{id}/credit-notes

Append credit note records to an existing settlement.

### Request body

```json
{
  "creditNotes": [
    { "creditNumb": "CN-001", "creditAmount": 2000.0, "creditDate": "2026-04-03", "creditRemark": null }
  ]
}
```

### Response `201 Created`

```json
{
  "creditNotes": [ { "id": 1, "creditNumb": "CN-001", "creditAmount": 2000.0, "creditDate": "2026-04-03", "creditRemark": null, "createdAt": "2026-04-05T10:05:00" } ]
}
```

### Response `404 Not Found`

---

## GET /v2/settlements/overview

The account team's worklist query — lists settlements with both state dimensions computed, for scanning what's still outstanding or unreviewed. Equivalent in role to `GET /v2/order-contracts` for Purchasing.

### Query parameters

| Parameter      | Type   | Required | Description                                  |
| -------------- | ------ | -------- | --------------------------------------------- |
| `contractType` | string | No       | `ORDER`, `BRANCH`, or `PROMO`                |
| `contractId`   | int    | No       | Filter to a single contract                   |
| `balanceState` | string | No       | `OUTSTANDING` or `SETTLED`                    |
| `reviewState`  | string | No       | `UNREVIEWED` or `REVIEWED`                    |
| `incomeType`   | string | No       | `Bill`, `FreeItem`, `Invoice`, or `CreditNote` — matches settlements whose contract has this income type in its allowed set (`other_income_contract_income_types`), case-insensitive |

### Response `200 OK`

```json
[
  {
    "id": 12,
    "contractId": 4,
    "contractType": "ORDER",
    "periodName": "Q1-2026",
    "startDate": "2026-01-01",
    "endDate": "2026-03-31",
    "supplierIncome": 66000.0,
    "appendedTotal": 64500.0,
    "remaining": 1500.0,
    "balanceState": "OUTSTANDING",
    "reviewState": "UNREVIEWED"
  }
]
```

`appendedTotal` sums `invoice_amount` + `credit_amount` + `bill_discount.subtotal_amount` + `free_item.subtotal_amount` across all four child tables for the settlement — not restricted to one income type. `remaining = supplierIncome - appendedTotal`; `balanceState = OUTSTANDING` if `remaining > 1`, else `SETTLED`.

---

## GET /v2/settlements/invoice-states

Narrow query for the invoice→receipt matching sub-workflow — separate from `balanceState` because an invoice can be open (unmatched/partially matched) independently of whether the settlement's overall balance has reconciled. Includes comp/contract-label context so the frontend can navigate directly without a second lookup.

### Query parameters

| Parameter      | Type   | Required | Description                                  |
| -------------- | ------ | -------- | --------------------------------------------- |
| `invoiceState` | string | No       | `UNMATCHED` or `MATCHED`                      |
| `contractType` | string | No       | `ORDER`, `BRANCH`, or `PROMO`                |
| `contractId`   | int    | No       | Filter to a single contract                   |
| `compType`     | string | No       | `DN` or `HU` — lets each accounting team (DN/HU) filter to only the suppliers they own |

### Response `200 OK`

```json
[
  {
    "invoiceId": 7,
    "settlementId": 12,
    "contractId": 4,
    "contractType": "ORDER",
    "compCode": "1234",
    "compType": "DN",
    "compName": "ACME Distribution",
    "contractLabelName": "Annual Rebate",
    "incomeLabelName": "Rebate",
    "invoiceNumb": "INV-002",
    "invoiceDate": "2026-02-11",
    "invoiceAmount": 1500.0,
    "matchedAmount": 0.0,
    "invoiceState": "UNMATCHED",
    "receiptNumbs": null,
    "lastReceiptDate": null
  }
]
```

`invoiceDate` is the date on the supplier's invoice document (`null` if not recorded), shown in the worklist as `วันที่ใบแจ้งหนี้` — distinct from `lastReceiptDate`, which is the date of the most recent matched receipt.

`incomeLabelName` comes from the contract's `Invoice`-type entry in `other_income_contract_income_types` (via `income_label_id` → `other_income_income_labels.name`) — it's `null` if the contract has no income label configured for the `Invoice` income type.

`invoiceState = UNMATCHED` if `invoiceAmount - matchedAmount > 1` (covers both a fully unmatched invoice and a partially-matched one — the remediation action is the same, chase the receipt), else `MATCHED`.

---

## POST /v2/settlements/{id}/review

Marks a settlement as reviewed by accounting — an explicit workflow action, independent of `balanceState`. Does not require the settlement to be `SETTLED` first; review is a judgment call, not a system-enforced gate.

### Request body

```json
{ "reviewedBy": "accounting_user" }
```

### Response `204 No Content`

### Response `404 Not Found`

---

## DELETE /v2/settlements/{id}

Delete a settlement and release all its picked income entries back to open state.

### Path parameters

| Parameter | Type | Description   |
| --------- | ---- | ------------- |
| `id`      | int  | Settlement ID |

### Response `204 No Content`

### Response `404 Not Found`

```json
{ "error": "settlement not found" }
```
