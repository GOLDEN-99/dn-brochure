# Report API

Base path: `/v2/report`

Report endpoints expose pre-aggregated views for accounting and purchasing teams. All endpoints are read-only.

---

## GET /v2/report/accrual-state

Per-(contract, month) accrual summary from `vw_other_income_accrual_state`. Sums income entries for that contract+month into a single net figure — `AUTO`, `CN_CORRECTION`, and `MANUAL_CORRECTION` rows are included; `LAG_CORRECTION` rows are excluded (lag corrections adjust the supplier-side figure only, not the system accrual — see [`supplier-lag-design.md`](../supplier-lag-design.md) §6.2a).

### Query parameters

| Parameter      | Type             | Required | Description                                       |
| -------------- | ---------------- | -------- | --------------------------------------------------- |
| `contractType` | string           | **Yes**  | `order`, `branch`, or `promo` (case-insensitive)    |
| `contractId`   | int              | No       | Filter to a single contract                         |
| `monthFrom`    | string (yyyy-MM) | No       | Inclusive lower bound on month                      |
| `monthTo`      | string (yyyy-MM) | No       | Inclusive upper bound on month                       |

### Response `200 OK`

```json
[
  {
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-01-01",
    "netOrderAmount": 950000.0,
    "estimateIncome": 14250.0
  },
  {
    "contractId": 1,
    "contractType": "ORDER",
    "month": "2026-02-01",
    "netOrderAmount": 800000.0,
    "estimateIncome": 12000.0
  }
]
```

### Notes

- `netOrderAmount = SUM(orderAmount)` across every entry (any type) for that contract+month. Corrections carry a signed `orderAmount`, so this already reflects CN/lag/manual adjustments netted against the `AUTO` estimate — no separate subtraction needed.
- `estimateIncome = SUM(amount)` across the same set of entries.
- `BRANCH` and `PROMO` contracts do not have order amounts; `netOrderAmount` will be `null` for those.
- This view reports **aggregates only**. `AUTO` and correction entries for the same contract+month can be picked into different settlements at different times, so there's no single `settlementId`/`state` that can represent a month as a whole anymore — use [`GET /v2/income-entries`](income-entry-api.md) (which supports a `state` filter) for per-row open/picked status.

### Error responses

| Status | Condition                                 |
| ------ | ------------------------------------------ |
| `400`  | `contractType` is missing                  |
| `400`  | `monthFrom` or `monthTo` is not `yyyy-MM`   |
