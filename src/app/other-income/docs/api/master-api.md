# Master Lookup API

Base path: `/v2/master`

Read-only endpoints for populating dropdowns. No service layer — controllers call the repository directly.

---

## GET /v2/master/suppliers

Search supplier companies. Returns top 10 matches.

### Query parameters

| Parameter  | Type   | Required | Description                                      |
| ---------- | ------ | -------- | ------------------------------------------------ |
| `compType` | string | Yes      | `DN` or `HU`                                     |
| `compName` | string | No       | Name search (LIKE on `compName` and `compName2`) |
| `compCode` | string | No       | Exact company code                               |

### Response `200 OK`

```json
[
  {
    "compCode": "10001",
    "compName": "บริษัท ตัวอย่าง จำกัด",
    "compName2": "Example Co Ltd",
    "compGroupCode": "G01",
    "compType": "DN"
  }
]
```

### Source tables

- DN → `[Drug].[dbo].[DNCompInfo]`
- HU → `[Drug].[dbo].[CompInfo]`

Filter: `compStat != '0'` and `compName NOT LIKE '%(ยกเลิก)'`.

### Response `400 Bad Request`

Returned when `compType` is missing or not `DN`/`HU`.

---

## GET /v2/master/incomes

List all income labels. No query parameters.

### Response `200 OK`

```json
[{ "id": 1, "incomeName": "CN ลดมากับบิล", "incomeType": "Bill" }]
```

`incomeType` is one of `Bill`, `FreeItem`, `Invoice`, `CreditNote`.

Source table: `other_income_income_labels` (replaces v1 `other_income_income`). Maps to `incomeLabelId` on all contract types.

---

## GET /v2/master/events

List all event/contract labels. No query parameters.

### Response `200 OK`

```json
[{ "id": 23, "eventName": "DC Support", "eventType": "ORDER" }]
```

`eventType` is one of `ORDER`, `BRANCH`, `PROMO`.

Source table: `other_income_contract_labels` (replaces v1 `other_income_events`). Maps to `contractLabelId` on all contract types.

---

## GET /v2/master/branches

Search branches. Parameterized counterpart of v1's `GET /other-income/branch`.

### Query parameters

| Parameter | Type   | Required | Description                                                   |
| --------- | ------ | -------- | ------------------------------------------------------------- |
| `term`    | string | No       | Name search (LIKE on `branchName`); omit to list all branches |

### Response `200 OK`

```json
[{ "branchCode": "BR001", "branchName": "Silom Branch" }]
```

### Source table

`[Drug].[dbo].[BranchInfo]`

---

## GET /v2/master/bill-discounts

Search bill discount lines from purchase receipts, one row per receive/discount line. An order can have multiple discount lines (partial shipments against different supplier bills) — the UI searches by order, then lets the user pick which specific line(s) to append to a settlement, so results are flat rather than grouped.

### Query parameters

| Parameter    | Type   | Required | Description                                            |
| ------------ | ------ | -------- | ------------------------------------------------------ |
| `compType`   | string | Yes      | `DN` or `HU`                                           |
| `compCode`   | string | Yes      | Supplier company code                                  |
| `discType`   | string | Yes      | `Dc`, `Rebate`, `Ince`, `Compensate`, `Cash`, or `All` |
| `order`      | string | No       | Order number partial match                             |
| `orderStart` | date   | No       | Order date range start (`HistStockOrder`/`HistStockDNOrder.orderDate`) |
| `orderEnd`   | date   | No       | Order date range end                                   |

### Response `200 OK`

```json
[
  {
    "orderNumb": "PO-2026-001",
    "receNumb": "REC-001",
    "billNumb": "BILL-001",
    "billDate": "2026-01-15",
    "receDate": "2026-01-20",
    "incentiveAmount": 15000.0,
    "remark": "Dc"
  },
  {
    "orderNumb": "PO-2026-001",
    "receNumb": "REC-002",
    "billNumb": "BILL-002",
    "billDate": "2026-02-03",
    "receDate": "2026-02-08",
    "incentiveAmount": 4200.0,
    "remark": "Dc"
  }
]
```

### Field notes

One row per `(orderNumb, receNumb)` — no order-level total. An order can be partially shipped across multiple receives against different supplier bills, and the UI's picking flow needs the user to choose which specific line(s) to include in a settlement, so nothing is pre-summed or nested.

| Field               | Description                                                              |
| --------------------- | ------------------------------------------------------------------------|
| `orderNumb`            | Order number — the key Purchasing knows up front.                       |
| `receNumb`             | Receive number — needed by Accounts, alongside `billNumb`.              |
| `billNumb`             | Supplier's bill number for this receive.                                |
| `incentiveAmount`      | Supplier incentive amount for this receive line (the discount owed).    |
| `remark`               | Human-readable label for the selected `discType`.                       |

`incentiveAmount` here is named for what it represents (supplier incentive income), not for the settlement column it eventually lands in — `POST /v2/settlements/{id}/bill-discounts` expects `BillDiscountInput.SubtotalAmount`, so the caller maps `incentiveAmount` → `subtotalAmount` when building that request; every other field (`orderNumb`, `receNumb`, `remark`) carries over unchanged.

### discType → column mapping

| discType     | Column           |
| ------------ | ---------------- |
| `Dc`         | `DcDisc`         |
| `Rebate`     | `RebateDisc`     |
| `Ince`       | `IncentiveDisc`  |
| `Compensate` | `Compensate`     |
| `Cash`       | `cashDisc`       |
| `All`        | Sum of all above |

### Source tables

- DN → `[Drug].[dbo].[HistStockDNRece]`, joined to `[Drug].[dbo].[HistStockDNOrder]` on `orderNumb` for `orderDate` filtering
- HU → `[Drug].[dbo].[HistStockRece]`, joined to `[Drug].[dbo].[HistStockOrder]` on `orderNumb` for `orderDate` filtering

### Response `400 Bad Request`

Returned when any of `compType`, `compCode`, or `discType` is missing.

---

## GET /v2/master/free-products

Search free product lines from purchase receipts, one row per receive/product line — same flat shape as bill discounts, and for the same reason (user picks specific lines to append to a settlement).

### Query parameters

| Parameter    | Type   | Required | Description                                                                |
| ------------ | ------ | -------- | -------------------------------------------------------------------------- |
| `compType`   | string | Yes      | `DN` or `HU`                                                               |
| `compCode`   | string | Yes      | Supplier company code                                                      |
| `itemRema`   | string | Yes      | `Dc`, `Rebate`, `Ince`, `Compensation`, `Promotion`, `Charge`, `Others`, or `All` |
| `order`      | string | No       | Order number partial match                                                 |
| `orderStart` | date   | No       | Order date range start (`HistStockOrder`/`HistStockDNOrder.orderDate`)     |
| `orderEnd`   | date   | No       | Order date range end                                                       |

### Response `200 OK`

```json
[
  {
    "orderNumb": "PO-2026-001",
    "receNumb": "REC-001",
    "billNumb": "BILL-001",
    "billDate": "2026-01-15",
    "receDate": "2026-01-20",
    "goodCode": "A001",
    "goodName": "สินค้า A",
    "barCode": "1234567890",
    "incentiveAmount": 5000.0,
    "remark": "Promotion"
  }
]
```

### Field notes

One row per `(orderNumb, receNumb, goodCode)` — same partial-shipment reasoning as bill discounts.

| Field                        | Description                                                    |
| ------------------------------ | --------------------------------------------------------------|
| `orderNumb`                     | Order number.                                                  |
| `receNumb`                      | Receive number for this free-item line.                        |
| `billNumb`                      | Supplier's bill number for this receive.                        |
| `goodCode/goodName/barCode`     | Product detail from `GoodInfo`.                                |
| `incentiveAmount`               | Supplier incentive amount for this line (`discAmou`).           |
| `remark`                        | Human-readable label for the selected `itemRema`.               |

`incentiveAmount` maps to `FreeItemInput.SubtotalAmount` when building `POST /v2/settlements/{id}/free-items` — `orderNumb`, `receNumb`, `goodCode`, `remark` carry over unchanged. `goodName`/`barCode` are display-only and have no counterpart on `FreeItemInput`.

### itemRema → itemRema column mapping

| itemRema       | `sol.itemRema` value                                    |
| -------------- | -------------------------------------------------------- |
| `Dc`           | `''` (empty)                                              |
| `Rebate`       | `'Rebate'`                                                |
| `Ince`         | `'Incentive'`                                             |
| `Compensation` | `'Compensate'`                                            |
| `Promotion`    | `'Promotion'`                                             |
| `Charge`       | `'ค่าแรกเข้าสินค้า'`                                      |
| `Others`       | Anything not in the six named values above                |
| `All`          | No `itemRema` filter — every line regardless of category   |

Any `itemRema` value not recognized by the API also falls back to `All`, matching how an unrecognized `discType` falls back to summing every discount type on `GET /v2/master/bill-discounts`.

Filter: `sol.itemType = 'X'` and `sol.discAmou != 0`.

### Source tables

- DN headers → `[Drug].[dbo].[HistStockDNRece]`, order lines → `[Drug].[dbo].[StockDNOrderList]`, order header (for `orderDate`) → `[Drug].[dbo].[HistStockDNOrder]`
- HU headers → `[Drug].[dbo].[HistStockRece]`, order lines → `[Drug].[dbo].[StockOrderList]`, order header (for `orderDate`) → `[Drug].[dbo].[HistStockOrder]`
- Products joined from `[Drug].[dbo].[GoodInfo]`

### Response `400 Bad Request`

Returned when any of `compType`, `compCode`, or `itemRema` is missing.
