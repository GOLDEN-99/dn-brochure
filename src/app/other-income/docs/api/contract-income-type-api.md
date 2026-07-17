# Contract Income Type API

Base path: `/v2/contracts/{contractType}/{contractId}/income-types`

Each contract can have one or more income types that determine how the supplier pays out (Bill, FreeItem, Invoice, or CreditNote). The `{contractType}` path segment is `ORDER`, `BRANCH`, or `PROMO`.

A contract can have **at most one row per `incomeType`** (enforced by `UQ_contract_income_type` on `(contract_id, contract_type, income_type)`) — e.g. you cannot add `Bill` with `incomeLabelId: 1` and then `Bill` with `incomeLabelId: 2` on the same contract.

For order contracts, income types are normally supplied at creation time via [`POST /v2/order-contracts`](order-contract-api.md) (at least one is required there). This endpoint is for adding/removing income types after the contract already exists.

---

## GET /v2/contracts/{contractType}/{contractId}/income-types

List all income types configured on a contract.

### Path parameters

| Parameter      | Type   | Description                         |
| -------------- | ------ | ----------------------------------- |
| `contractType` | string | `ORDER`, `BRANCH`, or `PROMO`       |
| `contractId`   | int    | Contract ID                         |

### Response `200 OK`

```json
[
  {
    "id": 1,
    "contractId": 1,
    "contractType": "ORDER",
    "incomeType": "Invoice",
    "incomeLabelId": 2,
    "incomeLabelName": "Standard Invoice",
    "createdAt": "2026-06-04T09:00:00"
  }
]
```

`incomeLabelName` is resolved from `other_income_income_labels` via `incomeLabelId` and is `null` when `incomeLabelId` is `null`.

---

## POST /v2/contracts/{contractType}/{contractId}/income-types

Add an income type to a contract.

### Path parameters

| Parameter      | Type   | Description                   |
| -------------- | ------ | ----------------------------- |
| `contractType` | string | `ORDER`, `BRANCH`, or `PROMO` |
| `contractId`   | int    | Contract ID                   |

### Request body

```json
{
  "incomeType": "Invoice",
  "incomeLabelId": 2
}
```

### Field rules

| Field           | Rule                                                              |
| --------------- | ----------------------------------------------------------------- |
| `incomeType`    | Must be `Bill`, `FreeItem`, `Invoice`, or `CreditNote`           |
| `incomeLabelId` | Required when `incomeType = Invoice`. Optional otherwise; `null` if not applicable |

### Response `201 Created`

```json
{
  "id": 1,
  "contractId": 1,
  "contractType": "ORDER",
  "incomeType": "Invoice",
  "incomeLabelId": 2,
  "incomeLabelName": "Standard Invoice",
  "createdAt": "2026-06-04T09:00:00"
}
```

### Response `400 Bad Request`

Validation error (e.g. invalid `incomeType` value).

### Response `409 Conflict`

```json
{ "error": "income_type Invoice already exists on this contract" }
```

---

## DELETE /v2/contracts/{contractType}/{contractId}/income-types/{incomeType}

Remove an income type from a contract.

### Path parameters

| Parameter      | Type   | Description                            |
| -------------- | ------ | -------------------------------------- |
| `contractType` | string | `ORDER`, `BRANCH`, or `PROMO`          |
| `contractId`   | int    | Contract ID                            |
| `incomeType`   | string | `Bill`, `FreeItem`, `Invoice`, or `CreditNote` |

### Response `204 No Content`

### Response `404 Not Found`

The income type does not exist on this contract.
