# Other Income System — Context for Re-evaluation

> A reference document capturing the purpose, design decisions, known problems, proposed solutions, and open questions for the Other Income system. Use this when revisiting the system to remember what was decided, why, and what still needs verification.

---

## 1. Purpose & Scope

The Other Income system records miscellaneous income — primarily incentive/support payments from suppliers to the company. It is not retrospective: the goal is to document _expected_ income for month M by the 5th of M+1, then true-up against actual settlement when supplier confirms.

### Event / contract types

1. **DC / Rebate** — order-based subsidies (focus of this system)
1. **Display fee** — per-branch, per-month screen-time payments
1. **Product push / product cheering** — collected from existing system

### Income payment methods (how a contract is paid out)

1. **Bill discount / CN referenced to order** — purchasing appends a received order
1. **Free item** — purchasing appends a received order line item
1. **Invoice** — anything not convertible above (e.g. cashback); accounting appends invoice number → receipt number from SAP
1. **Credit note without order reference** — accounting appends received CN

A single contract may be paid via multiple income methods.

### Order-based calculation patterns (DC / Rebate)

1. **Flat rate** — e.g. 3% of every order
1. **Bracket** — e.g. 1% on 1M–2M, 2% above 2M
1. **Special bracket** — rate determined by bracket reached, but applied to the entire amount, not just within the bracket

---

## 2. Domain Entities (Proposed)

Split “other-income-not-light” into two entities for clearer modelling. Naming aligned by calculation driver:

| Entity              | Driver                                              | Notes                            |
| ------------------- | --------------------------------------------------- | -------------------------------- |
| `BranchBasedIncome` | Branch × month (display fee)                        | Was “other-income-light”         |
| `OrderBasedIncome`  | Order volume cumulative over contract (DC / Rebate) | The hard one                     |
| `PromotionIncome`   | Promotion campaign window                           | Subsumes product-push if it fits |

To verify: does product-push belong under `PromotionIncome` or as its own entity?

---

## 3. Workflow (DC / Rebate)

1. **Contract setup** — define which steps/products count, calculation type, settlement period
1. **Monthly accrual** — purchasing queries received-order income, adjusts for non-documented CNs
1. **System calculation** — applies rate to adjusted order amount; for special bracket, any cross-period rate change is recognized in the month the calc changes
1. **Periodic settlement** — accruals grouped and settled per contract cycle (quarterly / half-yearly / annual)

---

## 4. Hard Constraints

- Order data lives in a separate system — not native
- A received order can be partial
- A CN for cancelled orders is **not** documented anywhere in the system
- **Data lag**: shipped items take 10–20 days to appear in the DB; receiveDate may be back-dated. Example: `billDate = 2025-01-01`, `receiveDate = 2025-01-06`, but row is queryable only from 2025-01-20.
- Supplier provides settlement data only quarterly/half-yearly/annually
- Supplier sends data as PDF; no API. Total amount is guaranteed; line detail varies
- Special bracket applies to whole contract; common pattern is yearly contract with quarterly settlement, where Q2 counts cumulatively from Q1 base

---

## 5. Known Problems

### Problem 1 — Lag exceeds accounting’s tolerance

- Accounting demands monthly adjusted-order input by Day 5 of M+1
- Purchasing can only get true adjustments from supplier (quarterly), with 7–10 day turnaround after period close
- Result: purchasing books unadjusted query value; accounting calls it “wrong” without defining wrong

### Problem 2 — Date-basis mismatch

- Company uses **receiveDate** for accounting period assignment
- Supplier uses **shipped-out date** (= billDate in our DB) for the same data
- The 10–20 day lag means the same order falls in different periods on each side
- When numbers diverge at audit, can’t tell whether the cause is timing, undocumented CN, or data error

---

## 6. Design Decisions & Rationale

### 6.1 Append-only accrual model with negative correcting entries

- **Decision**: never mutate prior accrual rows; record corrections as new rows (possibly negative)
- **Why**: matches general-ledger pattern and event-sourcing; preserves audit trail; allows the same query to be reproduced
- **Why not**: rejected “stack-style edit/delete” because re-running calculations on edited rows breaks reproducibility; rejected “just query current data” because the same query yields different numbers on different days as DB backfills

### 6.2 `entry_type` field (to be added)

Disambiguate why a (possibly negative) row exists:

- `monthly_accrual` — initial calc for the month
- `data_refresh` — same-month re-run with more data
- `cn_adjustment` — supplier-confirmed cancellation
- `settlement_trueup` — quarterly/annual reconciliation
- `correction` — genuine error fix

### 6.3 State machine on (contract, month)

States: `pending → accrued → adjusted → settled`

- Block (or warn) moving M+1 to `accrued` until M is at least `adjusted`
- Removes dependence on user discipline (“I forgot to adjust last month”)

### 6.4 Idempotency

- Unique constraint on `(contract_id, month, entry_type = 'monthly_accrual')`
- `data_refresh`, `cn_adjustment`, `correction` rows remain unbounded

### 6.5 Cumulative-to-date modelling for special bracket

- Each entry references contract, cumulative order amount, applicable rate, cumulative earned-to-date
- Booked amount = delta from prior entry
- Bracket crossings, rate changes, and true-ups all use the same mechanic

### 6.6 “Current state” view layered on top

- Single SQL view aggregating the append-only table
- Provides the simple number business users want without losing the trail

---

## 7. Proposed Solutions (Not Yet Implemented)

### For Problem 1 — Lag

- **Reframe with accounting**: estimate-now-and-true-up is what GAAP/IFRS accrual accounting actually requires. Push back on the “Day 5 hard cut” if it’s blocking sensible design.
- **Get “wrong” defined measurably**: variance from final settlement under X%? Match supplier interim figure? Without a numeric target, no system can satisfy it.
- **Two-pass close**:
  - Day 5: initial estimate from partial data, tagged `initial_estimate`
  - Day 20: refresh with complete data, post delta as `data_refresh`
- **Backfill projection for Day-5 gap** (pick one):

1. Use partial data as-is, label honestly
1. Project missing tail at running daily rate (recommended start)
1. Per-supplier lag-distribution model from history

- **Empirical lag measurement**: if order table has insert/created timestamp, derive “Day 5 captures X% historically with σ Y%” — converts a vague complaint into a numeric target
- **Materiality threshold**: variance below threshold is “fine,” not escalated
- **Settlement true-up**: posted in supplier-confirmation month, not retroactively

### For Problem 2 — Date basis

- **Switch rebate calc to billDate** (already in DB; inventory/AP keep receiveDate). Kills the period-mismatch source of variance with one column change.
- **CN log**: lightweight capture of every cancellation/return purchasing hears about (date, supplier, order ref, amount). Doesn’t need to be in SAP.
- **Variance bridge report**: monthly reconciliation `raw orders − date-shift − logged CNs = adjusted base`. Residual is data-quality bucket — what audit needs.
- **PDF upload + reconcile workflow**: compare supplier-stated total vs system cumulative; route variance for categorization.

---

## 8. Borrowings Worth Considering (from D365 Rebate Management)

| Idea                                                               | Status                                 |
| ------------------------------------------------------------------ | -------------------------------------- |
| Posting profiles per income type (route to right GL automatically) | Not yet considered                     |
| Scheduled batch + status workbench dashboard                       | Not yet considered                     |
| Source document drill-down per accrual row                         | Partially — depends on reproducibility |
| Mid-cycle correction at order-line level                           | Currently total-level only             |
| Explicit `write-off` (= settlement true-up) as first-class concept | Achieved via `entry_type`              |

---

## 9. Open Questions (To Verify with Business)

- [x] Does the order table have an insert/created timestamp distinct from receiveDate? (Critical for empirical lag measurement.)
  > receDate is a date stamp, a billDate is user input date
- [ ] Pareto check: do top ~20 of ~300 contracts account for ~80% of rebate value? (If yes, focus estimation quality there.)
- [x] Typical $ magnitude of a monthly rebate accrual (for setting materiality threshold).
  > cannt provide. system lanch 3 months ago. so data is lacked.
- [x] Quarterly supplier PDF — itemized by order/invoice, or total only?
  > it depends some provide just a total number, some provide detail to line item. purchsing said we would try asking for detail document for every supplier. not gurantee.
- [x] In the Q1-base-for-Q2 cumulative case: does Q2 reference Q1 _as booked_ or _post-settlement_?
  > yes. a date basis adjustment should be a dual record in between contarct start and end date. a excluded of period P should be an included for period P-1.
- [ ] Single touchpoint at purchasing for CN events, or scattered? (Determines CN-log feasibility.)
- [x] Should product-push fit under `PromotionIncome` or be its own entity?
  > yes. for this scope keep it as a one name of PromotionIncome. they behave the same.
- [x] Is the Day-5 deadline genuinely immovable, or could it shift to Day 10/15?
  > no. however Accounting insist of book a wrong nuber as-is. no backward adjustment. however the settlement should use a supplier number.
- [x] When supplier sends interim quarterly figures, do they break down by month?
  > no
- [x] Top suppliers — any EDI / portal access where shipping data flows electronically?

  > no

** USER ANSWER **

- there are many question touching Dc/Rebate acurral and period.
- account insist of estimate/expected income as-is
- on posting period, accounting force purchasing to append adjustment amount so that our accural converge to supplier accurals. with as much as detail as possible
- account accept our acurral vs purchasing input accurals as a different income report.
- dual include and exclude would be perfer

---

## 10. Re-evaluation Checklist

When revisiting this system, walk these points:

**Has anything in the environment changed?**

- New data source from supplier (API, EDI, portal)?
- Order data lag reduced or eliminated upstream?
- Accounting team accepted estimate-and-true-up framing?
- New regulatory / audit pressure?

**Are the design decisions still valid?**

- Is the append-only model still the right pattern, or is it being worked around?
- Is `entry_type` being used consistently, or have new ad-hoc types crept in?
- Is the state machine being respected, or are months being accrued out of order?

**Are the proposed solutions implemented? If not, why not?**

- Day-5 / Day-20 two-pass close
- CN log
- Variance bridge report
- billDate switch
- PDF upload + reconcile

**New problems surfaced?**

- Variance trends: getting better or worse over time?
- Settlement disputes: frequency, root cause distribution
- User behaviour: is purchasing actually adjusting, or skipping?
- Audit findings since last review

**Is the borrowing list still relevant?**

- Have any D365-style features become must-haves due to growth in contract volume?
- Is “buy vs build” worth revisiting?

---

## 11. Glossary

- **DC / Rebate** — discount / rebate; supplier subsidy based on purchase order volume
- **Accrual** — booked expected income for a period before settlement
- **Settlement** — final reconciliation with supplier; usually quarterly/half/annual
- **True-up** — adjustment posted when accrued estimate is reconciled to actual
- **CN** — credit note
- **billDate** — date supplier issued the bill / shipped the goods (in our DB)
- **receiveDate** — date company received the goods (in our DB; may be back-dated)
- **Special bracket** — bracket-based rate that applies to the _whole_ contract amount, not just within the bracket
