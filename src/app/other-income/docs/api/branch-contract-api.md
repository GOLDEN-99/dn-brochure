# Branch Contract API

Base path: `/v2/branch-contracts`

Branch contracts cover display fee income. Each contract has one spec (`maxBranches` cap + `ratePerBranch`) and a list of branch entries with open/close dates.

Monthly accrual formula: `ratePerBranch × MIN(activeBranches, maxBranches)`

---

## GET /v2/branch-contracts

List all branch contracts. Optionally filter by supplier.

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
    "compType": "HU",
    "contractLabelId": 2,
    "contractLabelName": "Light Box",
    "settlementPeriod": 3,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "createdAt": "2026-06-04T09:00:00"
  }
]
```

`compName` is `null` when the referenced company can't be found (e.g. inactive/removed) — it comes from a `LEFT JOIN` against `CompInfo`/`DNCompInfo`. `contractLabelName` is always present.

---

## GET /v2/branch-contracts/{id}

Get a single contract with its spec, all branch entries, and income types. Unlike the list endpoint, this enriches raw codes with display names looked up from master data (`CompInfo`/`DNCompInfo`, `other_income_contract_labels`, `BranchInfo`, `other_income_income_labels`).

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
  "compType": "HU",
  "contractLabelId": 2,
  "contractLabelName": "Light Box",
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "createdAt": "2026-06-04T09:00:00",
  "spec": {
    "id": 1,
    "maxBranches": 10,
    "ratePerBranch": 5000.0
  },
  "branches": [
    {
      "id": 1,
      "branchCode": "BR001",
      "branchName": "Silom Branch",
      "openDate": "2026-01-01",
      "closeDate": null,
      "createdAt": "2026-06-04T09:00:00"
    },
    {
      "id": 2,
      "branchCode": "BR002",
      "branchName": null,
      "openDate": "2026-02-01",
      "closeDate": "2026-05-31",
      "createdAt": "2026-06-04T09:00:00"
    }
  ],
  "incomeTypes": [
    {
      "id": 1,
      "contractId": 1,
      "contractType": "BRANCH",
      "incomeType": "Bill",
      "incomeLabelId": null,
      "incomeLabelName": null,
      "createdAt": "2026-06-04T09:00:00"
    }
  ]
}
```

`compName` and `branches[].branchName` are `null` when the referenced master-data row can't be found (e.g. inactive/removed company or branch) — these come from `LEFT JOIN`s against `CompInfo`/`DNCompInfo` and `BranchInfo`, tables this API doesn't own.

`contractLabelName` is always present — `contract_label_id` has a foreign key into `other_income_contract_labels`, so the label is guaranteed to exist.

`incomeTypes` mirrors [`GET /v2/contracts/BRANCH/{id}/income-types`](contract-income-type-api.md) — same rows, same shape.

### Response `404 Not Found`

---

## POST /v2/branch-contracts

Create a new branch contract and its spec atomically.

### Request body

```json
{
  "compCode": "10001",
  "compType": "HU",
  "contractLabelId": 2,
  "settlementPeriod": 3,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "maxBranches": 10,
  "ratePerBranch": 5000.0
}
```

### Field rules

| Field              | Rule                           |
| ------------------ | ------------------------------ |
| `compType`         | Must be `DN` or `HU`           |
| `settlementPeriod` | Must be `1`, `3`, `6`, or `12` |
| `endDate`          | Must be after `startDate`      |
| `maxBranches`      | Must be greater than zero      |
| `ratePerBranch`    | Must be greater than zero      |

### Response `201 Created`

```json
{ "id": 1 }
```

### Response `400 Bad Request`

```json
{ "error": "settlement_period must be 1, 3, 6, or 12" }
```

---

## PUT /v2/branch-contracts/{id}

Update contract header fields. Does not touch the spec or branch entries.

### Request body

```json
{
  "contractLabelId": 2,
  "settlementPeriod": 6,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### Response `204 No Content`

### Response `404 Not Found`

---

## PUT /v2/branch-contracts/{id}/spec

Update the branch spec (max branches and rate per branch).

### Request body

```json
{
  "maxBranches": 12,
  "ratePerBranch": 5500.0
}
```

### Field rules

| Field           | Rule                      |
| --------------- | ------------------------- |
| `maxBranches`   | Must be greater than zero |
| `ratePerBranch` | Must be greater than zero |

### Response `204 No Content`

### Response `400 Bad Request`

```json
{ "error": "max_branches must be greater than zero" }
```

### Response `404 Not Found`

---

## POST /v2/branch-contracts/{id}/branches

Add a branch entry to the contract.

### Request body

```json
{
  "branchCode": "BR003",
  "openDate": "2026-03-01"
}
```

### Field rules

| Field        | Rule                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| `openDate`   | Must be within contract `startDate` and `endDate`                          |
| `branchCode` | Must not already be active (no open entry with same code on this contract) |

### Response `201 Created`

```json
{ "entryId": 3 }
```

### Response `400 Bad Request`

```json
{ "error": "branch BR003 is already active on this contract" }
```

### Response `404 Not Found`

Contract does not exist.

---

## PUT /v2/branch-contracts/{id}/branches/{entryId}/close

Close a branch entry by setting its `closeDate`. The branch entry row is kept — it is never deleted.

### Path parameters

| Parameter | Type | Description     |
| --------- | ---- | --------------- |
| `id`      | int  | Contract ID     |
| `entryId` | int  | Branch entry ID |

### Request body

```json
{ "closeDate": "2026-05-31" }
```

### Field rules

| Field       | Rule                                       |
| ----------- | ------------------------------------------ |
| `closeDate` | Must be on or after the entry's `openDate` |

### Response `204 No Content`

### Response `400 Bad Request`

```json
{ "error": "branch entry is already closed" }
```

### Response `404 Not Found`

Contract does not exist.
