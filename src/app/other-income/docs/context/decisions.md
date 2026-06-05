## Track D — Schema & Migration

### TD-1: Final v2 schema migration script

**Status: DONE — file: `migration/2026-06-04-other-income-v2.sql`**

#### Table inventory

| New Table                                 | Replaces                                                                | Track   |
| ----------------------------------------- | ----------------------------------------------------------------------- | ------- |
| `other_income_contract_labels`            | `other_income_events`                                                   | Shared  |
| `other_income_income_labels`              | `other_income_income`                                                   | Shared  |
| `other_income_supplier_pairs`             | `other_income_dual_pairs` (permanent master data now)                   | Track A |
| `other_income_order_contracts`            | `other_income_heads` (event_type=1)                                     | Track A |
| `other_income_order_specs`                | `other_income_not_light`                                                | Track A |
| `other_income_order_steps`                | `other_income_step_lists`                                               | Track A |
| `other_income_order_products`             | `other_income_products`                                                 | Track A |
| `other_income_branch_contracts`           | `other_income_heads` (event_type=2)                                     | Track B |
| `other_income_branch_specs`               | `other_income_light` (drops capacity counters)                          | Track B |
| `other_income_branch_entries`             | `other_income_branch_lists` (drops period_id coupling, adds close_date) | Track B |
| `other_income_promo_contracts`            | `other_income_heads` (event_type=3)                                     | Track C |
| `other_income_contract_income_types`      | `income_type` field on head + `other_income_head_incomes` junction      | Shared  |
| `other_income_income_entries`             | `other_income_lists`                                                    | Shared  |
| `other_income_cn_orders`                  | _(new)_ cancelled order correction log                                  | Track A |
| `other_income_settlements`                | `other_income_periods`                                                  | Shared  |
| `other_income_settlement_supplier_orders` | _(new)_ optional supplier order line detail per settlement              | Track A |
| `other_income_v2_bill_discounts`          | `other_income_bill_discounts`                                           | Shared  |
| `other_income_v2_free_items`              | `other_income_free_items`                                               | Shared  |
| `other_income_v2_invoices`                | `other_income_invoices`                                                 | Shared  |
| `other_income_v2_receipts`                | `other_income_receipts`                                                 | Shared  |
| `other_income_v2_invoice_receipt_matches` | `other_income_invoice_receipt_matches`                                  | Shared  |
| `other_income_v2_credit_notes`            | `other_income_credit_notes`                                             | Shared  |

#### Dropped tables (not migrated)

| Table                            | Reason                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `other_income_purchase_receipts` | Audit trail of order lines per accrual — too large, unused in practice (TA-3) |
| `other_income_po_lists`          | Same — deprecated in v2 (TA-3)                                                |
| `other_income_head_comps`        | Multi-company support folded into contract structure                          |

#### Key constraints

- `other_income_income_entries`: unique index on `(contract_id, contract_type, month)` — one entry per contract per month, idempotency guard (TA-2).
- `other_income_income_entries` and `other_income_cn_orders`: `settlement_id` FK to `other_income_settlements` — NULL = open, NOT NULL = picked (OQ-1).
- All settlement detail tables carry FK to `other_income_settlements` (not periods).
- `contract_type` VARCHAR discriminator on `other_income_income_entries`, `other_income_cn_orders`, and `other_income_settlements` avoids a single monolithic contracts table while keeping a unified ledger.

---

### TD-2: "Current state" SQL view

**Status: DONE — `vw_other_income_accrual_state` in `migration/2026-06-04-other-income-v2.sql`**

#### Design decisions

- Standard (non-materialised) view. Query volume is low enough at this stage; revisit if reporting becomes slow.
- Single view covering all three contract types — `contract_type` column lets callers filter by track.
- Groups by `(contract_id, contract_type, month)`. Joins `other_income_cn_orders` to aggregate CN corrections.
- Columns: `estimate_order_amount`, `estimate_income` (both immutable from entry row), `cn_order_amount` (SUM of CN slices for that month), `net_order_amount` (estimate − cn; input to Step() for system number), `settlement_id`, `state` (open/picked derived from settlement_id).
- System income and supplier income are on the settlement row, not the view — report joins settlement to get those.
- No separate accounting-only view at this stage; one operational view is sufficient.

---

## Track 0 — Cross-Cutting Decisions

### T0-1: Confirm domain entity naming and boundaries

**Status: DONE**

#### Final entity names

| v2 Entity           | Driver                                              | Accrual model         |
| ------------------- | --------------------------------------------------- | --------------------- |
| `OrderBasedIncome`  | Order volume cumulative over contract (DC / Rebate) | System-calculated     |
| `BranchBasedIncome` | Branch × month (display fee)                        | Fixed per-branch rate |
| `PromotionIncome`   | Promotion campaign window                           | Manual entry, no calc |

#### v1 tables replaced by each entity

| v2 Entity           | v1 Tables Replaced                                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OrderBasedIncome`  | `other_income_heads` (event_type=1) + `other_income_not_light` + `other_income_step_lists` + `other_income_products` + `other_income_dual_pairs` + `other_income_head_incomes` + `other_income_head_comps` |
| `BranchBasedIncome` | `other_income_heads` (event_type=2) + `other_income_light` + `other_income_branch_lists`                                                                                                                   |
| `PromotionIncome`   | `other_income_heads` (event_type=3) — Ince and product-push; no separate spec table in v1                                                                                                                  |

Shared tables replaced across all entities:

- `other_income_events` → dropped; becomes a static enum (no table needed in v2)
- `other_income_income` → replaced by `income_method` enum on the contract
- `other_income_lists` → retained as the append-only accrual ledger (renamed/extended per T0-2)
- `other_income_periods` → replaced by Settlement entity (see T0-5)

#### Contract labelling and payment method

**`event_name` (contract subcategory label)**

- Carries forward from `other_income_events` as a managed lookup table.
- Required at contract setup. Especially important for `PromotionIncome` — each subcategory (anniversary, ค่าหยิบ, ค่าเชียร์, product-push) traces back to a different source system, so purchasing uses this label to verify input data.
- Rename table to `other_income_contract_labels` for clarity.

**`display_name`**

- Dropped. 700+ inserted records have empty value; field is unused in practice.
- Re-add only if a concrete need emerges.

**Payment method — one contract, many allowed methods**

- A contract can agree on multiple payment methods at setup time (e.g. FreeItem + Bill). The allowed set is stored in a junction table `other_income_contract_income_types` linking the contract to one or more `income_type` values.
- At settlement time, purchasing picks which method(s) apply for that settlement — constrained to the contract's allowed set.
- The `income_type` enum values remain: `Bill` / `FreeItem` / `Invoice` / `CreditNote`.

**Invoice subcategory label (`income_label`)**

- Required at contract setup when `Invoice` is one of the allowed `income_type` values.
- Stored as FK on the junction row (each `(contract, income_type)` pair may carry its own label).
- Most income types have one canonical name; Invoice has many user-defined subcategories (cashback, gift card, training cost, etc.) that vary by supplier.

#### Confirmed decisions

[x] Product-push fits under `PromotionIncome` — same behaviour, same entity.
[x] `PromotionIncome` is purely manual — no system calculation, purchasing enters amounts directly.
[x] `event_name` lookup table kept; rename to `other_income_contract_labels`.
[x] `display_name` dropped — unused.
[x] One contract = one or more agreed payment methods. Stored in junction table `other_income_contract_income_types`. (Updated: was single field.)
[x] Invoice subcategory (`income_label`) set per `(contract, income_type)` row in junction table (replaces `other_income_income`).

### T0-2: Settle the append-only accrual model and `entry_type` values

**Status: DONE**

#### Append-only model

Confirmed. Never mutate prior rows. All changes are new rows. Accounting accepts the Day-5 estimate as-is — no backward GL adjustment. `data_refresh` dropped (accounting accept-as-is makes same-month re-run irrelevant).

#### Dual record pattern

`settlement_trueup` uses dual-row insertion (forward-only):

- Row 1 (positive): include corrected amount in period P
- Row 2 (negative): exclude from period P+1, picked up by next settlement

`cn_adjustment` is a single negative row — a CN is a real event, not a date-basis shift, so no dual pair needed.

#### Final `entry_type` values

`other_income_income_entries` has no `entry_type` column — only one kind of row exists (monthly income estimate). The unique index on `(contract_id, contract_type, month)` enforces one row per month per contract.

Dropped entry types (OQ-1):

| entry_type          | Why dropped |
| ------------------- | ----------- |
| `cn_adjustment`     | CN is an order base modifier, not an income modifier. Moved to `other_income_cn_orders`. Income recalculated from corrected order base at report/settlement time. |
| `settlement_trueup` | Gap between system and supplier income is fully explained by running both sides through `Step()`. No forward-carry needed. |
| `data_refresh`      | Not needed; accounting accepts estimate as-is. |
| `correction`        | Dropped; add back only when a concrete use case forces it. |

---

#### OQ-1 resolved — 2026-06-04

**Status: DONE**

Three key clarifications drove the resolution:

1. Purchasing cannot provide CN corrections every month — the system estimate (`monthly_accrual`) must stand alone as the immutable month-by-month income record.
2. CN is an **order amount modifier**, not an income modifier. The cancelled order base reduces the input to `Step()`; the income change is recalculated, not entered directly.
3. Accounting needs three distinct numbers per month: raw estimate (no correction), system number (CN-corrected), and supplier number. These must never be conflated in the ledger.

**Decisions:**

| Question | Decision |
| -------- | -------- |
| Table name | Rename `other_income_accruals` → `other_income_income_entries` |
| `entry_type` | Only `monthly_accrual` remains. `cn_adjustment` and `settlement_trueup` entry types dropped. |
| `cn_adjustment` ledger rows | Dropped. CN is a separate table `other_income_cn_orders` storing cancelled order base per month slice. |
| `settlement_trueup` ledger rows | Dropped. Gap between system and supplier income is fully explained by running both sides through `Step()`. No forward-carry needed. |
| State encoding | `settlement_id` stamp replaces explicit `state` column (v1 pattern). `NULL` = open, `NOT NULL` = picked. Reversal: `UPDATE SET settlement_id = NULL WHERE settlement_id = @id`. Applies to both `other_income_income_entries` and `other_income_cn_orders`. |
| `system_total` replacement | Settlement stores five amounts: `system_order_amount`, `cn_order_amount`, `system_income` = `Step(system − cn)`, `supplier_order_amount`, `supplier_income` = `Step(supplier)`. All computed and stamped at post time. |
| Unearned revenue | `supplier_income − system_income` — derived by accounting report, not stored. |
| Cumulative order base | Settlement stores `cumulative_order_at_close` — running total of `(system_order_amount − cn_order_amount)` across all settlements for the contract. Seeds next settlement's bracket calculation without re-summing history. |
| CN granularity | One cancellation event can span multiple months. One `other_income_cn_orders` row per affected month. |
| Accounting report columns | `estimate_income` (raw, immutable) · `cn_order_amount` (correction input) · `net_order_amount` (corrected base). System income and supplier income come from the settlement row. Surfaced via `vw_other_income_accrual_state`. |

### T0-3: Define the (contract, month) state machine

**Status: DONE**

#### Entry row state (`other_income_income_entries` and `other_income_cn_orders`)

State is encoded as `settlement_id` (v1 stamping pattern — OQ-1):

| `settlement_id` | Meaning                                        |
| --------------- | ---------------------------------------------- |
| `NULL`          | Open — not yet included in any settlement      |
| `NOT NULL`      | Picked — included in the referenced settlement |

One-way transition only: `NULL` → settlement id. Reversed only if accounting deletes the settlement.

#### Settlement state

Single state: **`posted`**. Settlement is created and posted atomically in one transaction — no draft state.

On post, the system:

1. Stamps `settlement_id` on all selected income entry rows and CN rows
2. Computes and stores `system_order_amount`, `cn_order_amount`, `system_income`, `supplier_order_amount`, `supplier_income`, `cumulative_order_at_close` on the settlement row
3. Records bill-discount/free-item/invoice/receipt/credit-note detail rows if applicable

#### Correction path

Accounting deletes the settlement → system reverses in one transaction: `UPDATE SET settlement_id = NULL WHERE settlement_id = @id` on both `other_income_income_entries` and `other_income_cn_orders`, then deletes the settlement row → purchasing reposts.

#### Dropped states from v1

- `adjusted` — only existed to support `data_refresh`, which is dropped
- `accrued` — redundant; existence of a `monthly_accrual` row is the state
- Draft settlement — not needed; purchasing completes settlement in one action; no partial-save requirement

#### Constraints

- One settlement per contract (never spans multiple contracts)
- Bill-discount/free-item always part of settlement posting, never a standalone event

---

## Track B — Display Fee (BranchBasedIncome)

### TB-0: Branch spec — max_branches + rate_per_branch

**Status: DONE**

User wants to input a total contract amount; system derives rate per branch internally. However, `max_branches` and `rate_per_branch` are independent contract terms and must be stored separately:

- `max_branches` — ceiling on billable branches; the supplier agreed to pay for at most N branches.
- `rate_per_branch` — agreed unit price per branch per month.

Storing only a total and deriving rate would hide the actual agreed rate and break if the supplier adjusts `max_branches` without changing the unit price.

**Accrual formula:** `rate_per_branch × MIN(active_branches, max_branches)` per month. The cap is enforced at income-entry create time, not stored on the spec.

Replaces v1's `other_income_light.total_branch` (capacity) and implicit per-branch rate. `current_branch` counter dropped — active branch count is always derived from `other_income_branch_entries` rows.

### TB-1: Branch-add → auto-accrual trigger design

**Status: DONE**

#### v1 behaviour (baseline)

In v1, adding a branch to a light-box contract requires:

1. A period (`other_income_periods`) row already exists for the contract — created at `CreateLight` time, spanning one year from `start_date`.
2. Purchasing calls `POST /{lightId}/add-branch` with `{ branch_code, open_date, period_id }`.
3. System inserts into `other_income_branch_lists` and increments `other_income_light.current_branch`.
4. No accrual row is auto-created. Accrual amounts are baked into `other_income_periods.total_income` (set at period creation as `total_amount × total_branch`) — a denormalised running total, not derived from branch rows.
5. Branch capacity is enforced: insert is blocked if `current_branch >= total_branch`.

v1 pain points:

- `total_income` on the period is pre-set at creation time based on expected branch count, meaning it is wrong the moment branch count changes.
- No monthly accrual rows exist for light contracts — the period total is the only financial figure, making month-level reporting impossible.
- `period_id` on `other_income_branch_lists` couples branches to periods instead of contracts, making the data model brittle.

#### v2 decision

**Branch-add triggers a synchronous monthly accrual sweep for all open months in the contract window.**

Rationale: display fees are fixed per-branch per-month. As soon as a branch is active for a month, the system owes that month's fee. There is no calculation complexity (no order data needed), so synchronous creation is safe and keeps state consistent.

**Trigger behaviour on branch-add:**

| Step | Description                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Insert branch row into `branch_based_contract_branches` with `{ contract_id, branch_code, open_date }`                                                                                      |
| 2    | Determine months to accrue: all months M where `open_date ≤ last_day(M)` AND `M ≤ today's month` AND `M ≤ contract.end_date` AND no `monthly_accrual` row yet exists for `(contract_id, M)` |
| 3    | For each such month, insert a `monthly_accrual` row into `other_income_lists` with `amount = rate_per_branch × active_branch_count(M)`                                                      |
| 4    | Return `{ branch_id, accruals_posted: n }`                                                                                                                                                  |

`active_branch_count(M)` = count of branch rows for this contract where `open_date ≤ last_day(M)` and branch is not closed before M.

**No branch capacity cap** — v1's `total_branch` / `current_branch` counter is dropped. The capacity was a planning estimate that purchasing had to maintain manually; in v2 the branch list is the source of truth.

**Mid-month branch add — full month, no pro-rata.** Consistent with v1 behaviour. The fee is per-month-active, not per-day. If a branch opens on the 28th, the full month is owed.

**Branch removal (close date):**

- Purchasing records a `close_date` on the branch row (soft delete — row kept for audit).
- System writes a correcting `monthly_accrual` re-computation: for each open month M after `close_date`, if a `monthly_accrual` row exists and is in `open` state, re-compute `amount = rate_per_branch × active_branch_count(M)` and update in place. If the row is already `picked` (in a settlement), do nothing — the settlement already captured that month.
- Month of closure: full month is still owed (same full-month rule as add).
- No negative accrual rows written; amount is simply recalculated.

**Rate storage:** `rate_per_branch` is a field on the contract spec table (one fixed amount per contract). All branches on the same contract earn the same monthly rate.

#### Schema

**`branch_based_contract_spec`** (replaces `other_income_light`)

| Field             | Type          | Notes                               |
| ----------------- | ------------- | ----------------------------------- |
| `id`              | INT PK        | —                                   |
| `contract_id`     | INT FK        | Unique (one spec per contract)      |
| `rate_per_branch` | DECIMAL(18,4) | Fixed monthly fee per active branch |
| `created_at`      | DATETIME2     | —                                   |

**`branch_based_contract_branches`** (replaces `other_income_branch_lists`)

| Field         | Type         | Notes                                                   |
| ------------- | ------------ | ------------------------------------------------------- |
| `id`          | INT PK       | —                                                       |
| `contract_id` | INT FK       | Direct FK to contract (not to spec)                     |
| `branch_code` | NVARCHAR(50) | FK to BranchInfo                                        |
| `open_date`   | DATE         | First month this branch is active                       |
| `close_date`  | DATE NULL    | NULL = still active. Set by purchasing to remove branch |
| `created_at`  | DATETIME2    | —                                                       |

Dropped from v1: `period_id` on branch row (coupling removed), `total_branch` / `current_branch` capacity counters (no cap), `check_date` / `timestamp` duplicates.

---

### TB-2: Display Fee settlement workflow

**Status: DONE**

#### Settlement period

Display-fee contracts can have any `settlement_period` (1 / 3 / 6 / 12 months) — same as DC/Rebate. Monthly settlement is the common case but not mandatory.

#### Settlement uses same flow as DC/Rebate (T0-3 / TA-3)

The workflow is identical — purchasing selects open accrual months, inputs `supplier_total`, posts atomically. The only difference is there are no order-data queries involved; all accrual amounts are branch-count-driven.

| Step | Actor      | Action                                                  | System writes                                                                                                    |
| ---- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1    | Purchasing | Select accrual months (open `monthly_accrual` rows)     | —                                                                                                                |
| 2    | Purchasing | Enter `supplier_total` from supplier invoice            | —                                                                                                                |
| 3    | Purchasing | Optionally append bill-discount / free-item detail rows | —                                                                                                                |
| 4    | Purchasing | Confirm post                                            | Settlement row inserted; `system_total` = SUM of picked accruals; `trueup_delta` = supplier_total − system_total |
| 5    | System     | Mark included rows                                      | All selected `monthly_accrual` rows: `state` → `picked`                                                          |
| 6    | System     | Write trueup dual rows                                  | `settlement_trueup` ± pair (see T0-2 / T0-5)                                                                     |

**Income method** is drawn from the contract's allowed set in `other_income_contract_income_types`. Display-fee contracts typically use Invoice or CreditNote but any combination is allowed.

**Multiple income methods:** a display-fee contract may have more than one allowed method (e.g. FreeItem + Bill). Purchasing picks which method applies at settlement time, constrained to the contract's allowed set.

**Correction path:** accounting deletes the settlement → system reverses (all `picked` rows → `open`, trueup rows deleted). Purchasing reposts. Same as DC/Rebate.

---

### TB-3: Display Fee API endpoints

**Status: DONE**

#### Contract lifecycle (purchasing)

| Method | Path                     | Action                                                   | Request                                                                                                                               | Response                                                                                                                                                 |
| ------ | ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/branch-contracts`      | List contracts                                           | `?comp_type, comp_code, comp_name`                                                                                                    | `[{ id, comp_code, comp_type, comp_name, contract_label, income_label, start_date, end_date, settlement_period, rate_per_branch, active_branch_count }]` |
| POST   | `/branch-contracts`      | Create contract + spec                                   | `{ comp_code, comp_type, contract_label_id, income_types[{ income_type, income_label_id? }], settlement_period, start_date, end_date, rate_per_branch }` | `{ id }`                                                                                                                                                 |
| GET    | `/branch-contracts/{id}` | Get contract detail with branches, accruals, settlements | —                                                                                                                                     | `{ contract, spec, branches[], accruals[], settlements[] }`                                                                                              |
| DELETE | `/branch-contracts/{id}` | Delete contract (only if no accruals posted)             | —                                                                                                                                     | 204                                                                                                                                                      |

#### Branch management

| Method | Path                                               | Action                                                      | Request                      | Response                            |
| ------ | -------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- | ----------------------------------- |
| POST   | `/branch-contracts/{id}/branches`                  | Add branch → triggers accrual sweep                         | `{ branch_code, open_date }` | `{ branch_id, accruals_posted: n }` |
| PUT    | `/branch-contracts/{id}/branches/{branchId}/close` | Close branch (soft delete) → re-computes open future months | `{ close_date }`             | `{ accruals_updated: n }`           |
| DELETE | `/branch-contracts/{id}/branches/{branchId}`       | Hard delete branch (only if no accruals picked against it)  | —                            | 204                                 |

#### Accrual (driven by branch-add; manual recompute if needed)

| Method | Path                                        | Action                                                           | Request                                                 | Response                                      |
| ------ | ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| GET    | `/branch-contracts/{id}/accruals`           | List accruals with state                                         | `?from_month, to_month`                                 | `[{ id, month, entry_type, amount, state }]`  |
| POST   | `/branch-contracts/{id}/accruals/recompute` | Re-run accrual sweep for open months (purchasing manual trigger) | `{ month? }` — if month omitted, sweeps all open months | `{ accruals_posted: n, accruals_updated: n }` |

#### Settlement (same shape as DC/Rebate)

| Method | Path                                 | Action                         | Request                                                                                                           | Response                                                                                  |
| ------ | ------------------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST   | `/branch-contracts/{id}/settlements` | Post settlement atomically     | `{ period_name, start_date, end_date, accrual_ids[], supplier_total, remark?, bill_discounts[]?, free_items[]? }` | `{ id, system_total, supplier_total, trueup_delta }`                                      |
| GET    | `/branch-contracts/{id}/settlements` | List settlements               | —                                                                                                                 | `[{ id, period_name, start_date, end_date, system_total, supplier_total, trueup_delta }]` |
| GET    | `/settlements/{id}`                  | Get settlement detail          | —                                                                                                                 | `{ settlement, bill_discounts[], free_items[], invoices[], receipts[], credit_notes[] }`  |
| DELETE | `/settlements/{id}`                  | Delete settlement (accounting) | —                                                                                                                 | 204                                                                                       |

Settlement detail child row endpoints (`/settlements/{id}/bill-discounts`, `/invoices`, `/receipts`, `/credit-notes`, `/matches`) are shared with Track A — same paths, same shapes.

---

## Track C — Promotion / Salesman (PromotionIncome)

### TC-1: PromotionIncome data model and workflow

**Status: DONE**

#### v1 behaviour (baseline)

In v1, `EventTypeEnum.Ince (3)` contracts use `InsertMonthlyWithPeriod` — a single atomic call that simultaneously:

1. Creates an `other_income_lists` row with `cal_amount = 0`, `actual_amount = 0`, and `income_amount` = purchasing's entered figure.
2. Creates an `other_income_periods` row with `total_amount = total_income = income_amount`.
3. Links the two rows immediately.

There is no system calculation of any kind — purchasing enters the full income amount directly. The accrual and the period are created together in one action; there is no separate "post later" step.

#### v2 decisions

**No system calculation — purely manual.** Purchasing enters the income amount directly. There is no order query, no bracket table, no rate. `PromotionIncome` is a documentation entity, not a calculation entity.

**Monthly accrual rows are still used**, keeping the model consistent with DC/Rebate and Display Fee. Each purchasing entry becomes one `monthly_accrual` row in `other_income_lists`. This enables month-level reporting and the same settlement flow across all three income types.

**Accrual and settlement are decoupled** (unlike v1 where they were created together). Purchasing posts the accrual for a month, then later posts a settlement covering one or more accrual months. This matches the v2 pattern for all tracks.

**No spec table.** PromotionIncome has no calculation parameters — the contract table alone is sufficient. No bracket rows, no rate field, no filter flags.

**Product-push fits here unchanged** — same manual entry, same entity, same flow (confirmed T0-1).

#### Contract table fields (shared `other_income_heads` replacement)

The v2 contract table for PromotionIncome uses the same base fields as DC/Rebate and Display Fee. No extra spec table needed.

| Field               | Type        | Notes                                                             |
| ------------------- | ----------- | ----------------------------------------------------------------- |
| `id`                | INT PK      | —                                                                 |
| `comp_code`         | NVARCHAR    | FK to CompInfo / DNCompInfo                                       |
| `comp_type`         | NVARCHAR    | `DN` / `HU`                                                       |
| `contract_label_id` | INT FK      | FK to `other_income_contract_labels`                              |
| `income_types`      | junction    | One or more allowed payment methods via `other_income_contract_income_types`. Each row carries `income_type` (`Bill`/`FreeItem`/`Invoice`/`CreditNote`) + optional `income_label_id`. |
| `settlement_period` | INT         | Number of months. No DB constraint — allowed values not yet confirmed. |
| `start_date`        | DATE        | —                                                                 |
| `end_date`          | DATE        | —                                                                 |
| `created_at`        | DATETIME2   | —                                                                 |

No spec sub-table. No `supplier_pair_id` (promotion contracts are always single-supplier). No `calc_type` / bracket rows.

#### Accrual posting workflow (purchasing)

| Step | Actor      | Action                           | System writes                                                                              |
| ---- | ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 1    | Purchasing | Enter income amount and month    | —                                                                                          |
| 2    | Purchasing | Optionally enter a reason / note | —                                                                                          |
| 3    | Purchasing | Confirm post                     | `monthly_accrual` row inserted: `amount = entered_amount`, `reason = note`, `state = open` |

**Idempotency:** same unique constraint as DC/Rebate — `(contract_id, month)` WHERE `entry_type = 'monthly_accrual'`. Returns HTTP 409 if already posted for that month.

**Edit before settlement:** purchasing may delete and re-post a `monthly_accrual` row while it is still in `open` state. Once `picked` (inside a settlement), it cannot be changed — delete the settlement first.

#### Settlement workflow

Identical to DC/Rebate (T0-3 / TA-3). Purchasing selects open accrual months, inputs `supplier_total`, posts atomically. `settlement_trueup` dual rows written if `supplier_total ≠ system_total`. No deviation from the shared pattern.

---

### TC-2: PromotionIncome API endpoints

**Status: DONE**

#### Contract lifecycle (purchasing)

| Method | Path                    | Action                                            | Request                                                                                                              | Response                                                                                                           |
| ------ | ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| GET    | `/promo-contracts`      | List contracts                                    | `?comp_type, comp_code, comp_name`                                                                                   | `[{ id, comp_code, comp_type, comp_name, contract_label, income_label, start_date, end_date, settlement_period }]` |
| POST   | `/promo-contracts`      | Create contract                                   | `{ comp_code, comp_type, contract_label_id, income_types[{ income_type, income_label_id? }], settlement_period, start_date, end_date }` | `{ id }`                                                                                                           |
| GET    | `/promo-contracts/{id}` | Get contract detail with accruals and settlements | —                                                                                                                    | `{ contract, accruals[], settlements[] }`                                                                          |
| DELETE | `/promo-contracts/{id}` | Delete contract (only if no accruals posted)      | —                                                                                                                    | 204                                                                                                                |

#### Accrual (manual, purchasing)

| Method | Path                                         | Action                                | Request                      | Response                                             |
| ------ | -------------------------------------------- | ------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| GET    | `/promo-contracts/{id}/accruals`             | List accruals with state              | `?from_month, to_month`      | `[{ id, month, entry_type, amount, reason, state }]` |
| POST   | `/promo-contracts/{id}/accruals`             | Post monthly accrual                  | `{ month, amount, reason? }` | `{ id }` · 409 if already posted                     |
| DELETE | `/promo-contracts/{id}/accruals/{accrualId}` | Delete accrual (only if state = open) | —                            | 204                                                  |

#### Settlement (same shape as DC/Rebate and Display Fee)

| Method | Path                                | Action                         | Request                                                                                                           | Response                                                                                  |
| ------ | ----------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST   | `/promo-contracts/{id}/settlements` | Post settlement atomically     | `{ period_name, start_date, end_date, accrual_ids[], supplier_total, remark?, bill_discounts[]?, free_items[]? }` | `{ id, system_total, supplier_total, trueup_delta }`                                      |
| GET    | `/promo-contracts/{id}/settlements` | List settlements               | —                                                                                                                 | `[{ id, period_name, start_date, end_date, system_total, supplier_total, trueup_delta }]` |
| GET    | `/settlements/{id}`                 | Get settlement detail          | —                                                                                                                 | `{ settlement, bill_discounts[], free_items[], invoices[], receipts[], credit_notes[] }`  |
| DELETE | `/settlements/{id}`                 | Delete settlement (accounting) | —                                                                                                                 | 204                                                                                       |

Settlement detail child row endpoints (`/settlements/{id}/bill-discounts`, `/invoices`, `/receipts`, `/credit-notes`, `/matches`) are shared across all three tracks — same paths, same shapes.

---

## Track A — DC / Rebate (OrderBasedIncome)

### TA-5: DC/Rebate API endpoints

**Status: DONE**

#### Master data (lookup tables — purchasing admin)

| Method | Path                    | Action                   | Request                 | Response                      |
| ------ | ----------------------- | ------------------------ | ----------------------- | ----------------------------- |
| GET    | `/contract-labels`      | List all contract labels | —                       | `[{ id, name, event_type }]`  |
| POST   | `/contract-labels`      | Create label             | `{ name, event_type }`  | `{ id }`                      |
| PUT    | `/contract-labels/{id}` | Edit label               | `{ name }`              | `{ count }`                   |
| DELETE | `/contract-labels/{id}` | Delete label             | —                       | 204                           |
| GET    | `/income-labels`        | List all income labels   | —                       | `[{ id, name, income_type }]` |
| POST   | `/income-labels`        | Create label             | `{ name, income_type }` | `{ id }`                      |
| PUT    | `/income-labels/{id}`   | Edit label               | `{ name }`              | `{ count }`                   |
| DELETE | `/income-labels/{id}`   | Delete label             | —                       | 204                           |

#### Supplier pairs (master data — permanent, set once)

| Method | Path                   | Action                                   | Request                                        | Response                                             |
| ------ | ---------------------- | ---------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| GET    | `/supplier-pairs`      | List all pairs                           | —                                              | `[{ id, display_name, dn_comp_code, hu_comp_code }]` |
| POST   | `/supplier-pairs`      | Create pair                              | `{ display_name, dn_comp_code, hu_comp_code }` | `{ id }`                                             |
| GET    | `/supplier-pairs/{id}` | Get pair detail with both contract sides | —                                              | `{ id, display_name, dn_contract, hu_contract }`     |

#### Contract lifecycle (purchasing)

| Method | Path                      | Action                                                                                   | Request                                                                                                                                                                                                                               | Response                                                                                                           |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| GET    | `/order-contracts`        | List contracts                                                                           | `?comp_type, comp_code, comp_name, good_code`                                                                                                                                                                                         | `[{ id, comp_code, comp_type, comp_name, contract_label, income_label, start_date, end_date, settlement_period }]` |
| POST   | `/order-contracts`        | Create single contract + trigger backward accrual                                        | `{ comp_code, comp_type, contract_label_id, income_types[{ income_type, income_label_id? }], settlement_period, start_date, end_date, calc_type, cap_amount, exclude_vat, exclude_dc, exclude_rebate, exclude_ince, exclude_comp, steps[], products[] }` | `{ id, accruals_posted: n }`                                                                                       |
| POST   | `/order-contracts/paired` | Create DN+HU pair atomically, copy spec to both sides + trigger backward accrual on both | `{ supplier_pair_id, contract_label_id, income_types[{ income_type, income_label_id? }], settlement_period, start_date, end_date, calc_type, cap_amount, exclude_*, steps[], products[] }`                                                               | `{ dn_id, hu_id, accruals_posted: n }`                                                                             |
| GET    | `/order-contracts/{id}`   | Get contract detail with accruals and settlements                                        | —                                                                                                                                                                                                                                     | `{ contract, spec, steps[], products[], accruals[], settlements[] }`                                               |
| DELETE | `/order-contracts/{id}`   | Delete contract (only if no accruals posted)                                             | —                                                                                                                                                                                                                                     | 204                                                                                                                |

#### Accrual (background job + manual)

| Method | Path                                         | Action                                                                                            | Request             | Response                                                                                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/order-contracts/{id}/accrual-preview`      | Preview order query result for a month before posting                                             | `?month, comp_type` | `[{ rece_numb, bill_numb, line_base }]` + `{ monthly_base, cumulative_base, step_result_prev, step_result_current, accrual_amount }` |
| POST   | `/order-contracts/{id}/accruals`             | Post monthly accrual (purchasing manual or background job)                                        | `{ month }`         | `{ id, amount }` · 409 if already posted                                                                                             |
| POST   | `/order-contracts/paired/{pair_id}/accruals` | Post paired accrual — queries both sides atomically, splits proportionally, inserts independently | `{ month }`         | `{ dn_accrual_id, dn_amount, hu_accrual_id, hu_amount }` · 409 if already posted on either side                                      |

#### Settlement (purchasing post, accounting delete)

| Method | Path                                | Action                                                                             | Request                                                                                                           | Response                                                                                  |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/order-contracts/{id}/accruals`    | List accruals with state (open/picked)                                             | `?from_month, to_month`                                                                                           | `[{ id, month, entry_type, amount, state }]`                                              |
| POST   | `/order-contracts/{id}/settlements` | Post settlement atomically — marks accruals picked, writes trueup dual rows        | `{ period_name, start_date, end_date, accrual_ids[], supplier_total, remark?, bill_discounts[]?, free_items[]? }` | `{ id, system_total, supplier_total, trueup_delta }`                                      |
| GET    | `/order-contracts/{id}/settlements` | List settlements                                                                   | —                                                                                                                 | `[{ id, period_name, start_date, end_date, system_total, supplier_total, trueup_delta }]` |
| GET    | `/settlements/{id}`                 | Get settlement detail with all child rows                                          | —                                                                                                                 | `{ settlement, bill_discounts[], free_items[], invoices[], receipts[], credit_notes[] }`  |
| DELETE | `/settlements/{id}`                 | Delete settlement (accounting only) — reverses accrual states, removes trueup rows | —                                                                                                                 | 204                                                                                       |

#### Settlement detail rows (purchasing for bill/free-item, accounting for invoice/receipt/CN)

| Method | Path                                        | Action                          | Request                                                          | Response                                           |
| ------ | ------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| POST   | `/settlements/{id}/bill-discounts`          | Append bill-discount detail     | `{ order_numb, rece_numb, subtotal_amount, remark }`             | `{ id }`                                           |
| DELETE | `/settlements/{id}/bill-discounts/{itemId}` | Remove bill-discount detail     | —                                                                | 204                                                |
| POST   | `/settlements/{id}/free-items`              | Append free-item detail         | `{ order_numb, rece_numb, good_code, subtotal_amount, remark }`  | `{ id }`                                           |
| DELETE | `/settlements/{id}/free-items/{itemId}`     | Remove free-item detail         | —                                                                | 204                                                |
| POST   | `/settlements/{id}/invoices`                | Append invoice (accounting)     | `{ invoice_numb, invoice_amount, invoice_date, invoice_remark }` | `{ id }`                                           |
| DELETE | `/settlements/{id}/invoices/{itemId}`       | Remove invoice                  | —                                                                | 204                                                |
| POST   | `/settlements/{id}/receipts`                | Append receipt (accounting)     | `{ rece_numb, rece_amount, rece_date, rece_remark }`             | `{ id }`                                           |
| DELETE | `/settlements/{id}/receipts/{itemId}`       | Remove receipt                  | —                                                                | 204                                                |
| POST   | `/settlements/{id}/matches`                 | Match invoice to receipt        | `{ invoice_id, receipt_id, matched_amount }`                     | `{ id }`                                           |
| DELETE | `/settlements/{id}/matches/{matchId}`       | Remove match                    | —                                                                | 204                                                |
| GET    | `/settlements/{id}/matches`                 | List matches                    | —                                                                | `[{ id, invoice_id, receipt_id, matched_amount }]` |
| POST   | `/settlements/{id}/credit-notes`            | Append credit note (accounting) | `{ credit_numb, credit_amount, credit_date, credit_remark }`     | `{ id }`                                           |
| DELETE | `/settlements/{id}/credit-notes/{itemId}`   | Remove credit note              | —                                                                | 204                                                |

#### Lookup endpoints (shared with other tracks)

| Method | Path                    | Action                                              |
| ------ | ----------------------- | --------------------------------------------------- |
| GET    | `/comp/{comp_type}`     | Search supplier by comp_type (DN/HU), name, code    |
| GET    | `/products/{comp_type}` | Search products by comp_type, comp_code, code, name |
| GET    | `/branches`             | Search branches by term                             |

---

### TA-2: Monthly accrual entry schema and calculation rules

**Status: DONE**

#### Accrual row schema (`other_income_lists` replacement)

| Field         | Type          | Notes                                                                                 |
| ------------- | ------------- | ------------------------------------------------------------------------------------- |
| `id`          | INT PK        | —                                                                                     |
| `contract_id` | INT FK        | References contract                                                                   |
| `month`       | DATE          | First day of the month (e.g. 2026-01-01)                                              |
| `entry_type`  | VARCHAR       | `monthly_accrual` / `cn_adjustment` / `settlement_trueup`                             |
| `amount`      | DECIMAL(18,4) | Single calculated amount. Negative for cn_adjustment and trueup exclusion row.        |
| `reason`      | NVARCHAR(255) | Required for `cn_adjustment` and `settlement_trueup`. Optional for `monthly_accrual`. |
| `state`       | VARCHAR       | `open` / `picked`                                                                     |
| `created_at`  | DATETIME2     | —                                                                                     |

Unique constraint: `(contract_id, month)` WHERE `entry_type = 'monthly_accrual'` — enforced at both DB (partial unique index) and application layer (existence check before insert, returns clean 409 if duplicate).

Dropped from v1: `cal_amount`, `actual_amount` (split replaced by single `amount`), `cn` (now a separate `cn_adjustment` row), `check_date`, `period_id` (settlement link now on settlement row, not accrual row).

#### Universal accrual formula (all calc types, all contracts)

```
monthly_amount(M) = Step(cumulative_base(M)) − Step(cumulative_base(M−1))
```

Where `Step(x)` = total earned-to-date if cumulative base were `x`, per the contract's calc type and bracket table.
`cumulative_base(M)` = sum of all monthly order bases from contract start through month M.

For paired (DN/HU) contracts: `monthly_base(M) = dn_monthly_base(M) + hu_monthly_base(M)`. The cumulative is always combined. Each side's accrual row gets a proportional share:

- `dn_amount(M) = monthly_amount(M) × dn_monthly_base(M) / combined_monthly_base(M)`
- `hu_amount(M) = monthly_amount(M) × hu_monthly_base(M) / combined_monthly_base(M)`
- If `combined_monthly_base(M) = 0`: both sides post 0. No division performed.

This model handles bracket crossings naturally — no mid-month splitting needed. Extra gain from crossing a bracket is fully captured in the delta of the month it occurs.

#### Monthly order base calculation (from order data)

For each received order line within `receDate` in month M and `billDate` within contract window:

```
vat_multiplier = 1/1.07  if order is VAT-inclusive  and exclude_vat = true
               = 1.07    if order is VAT-exclusive   and exclude_vat = true
               = 1       otherwise

discount_adj = totalCost − (dcDisc × exclude_dc) − (rebateDisc × exclude_rebate)
                          − (inceDisc × exclude_ince) − (compDisc × exclude_comp)

line_base = (discount_adj / totalCost) × subtotal × vat_multiplier
```

Sum `line_base` across all matching lines → `monthly_base(M)`.

#### `Step()` function by calc type

**Flat:** `Step(x) = x × rate`

**Step (rate per bracket slice):**

```
Step(x) = Σ rate_i × (min(x, max_i) − min_i)  for each bracket i where x > min_i
```

**Cumulative (bracket reached sets rate for whole amount):**

```
Step(x) = x × rate_of_bracket_containing_x
```

---

#### Worked example 1 — Flat

**Contract:** 3% flat, no brackets

| Month | Monthly base | Cumulative | Step(cumulative) | Step(prev) | Accrual    |
| ----- | ------------ | ---------- | ---------------- | ---------- | ---------- |
| Jan   | 1,000,000    | 1,000,000  | 30,000           | 0          | **30,000** |
| Feb   | 800,000      | 1,800,000  | 54,000           | 30,000     | **24,000** |
| Mar   | 0            | 1,800,000  | 54,000           | 54,000     | **0**      |

---

#### Worked example 2 — Step (rate per bracket slice)

**Contract:** 0–3M @ 1%, 3M–8M @ 2%, 8M+ @ 3%

| Month | Monthly base | Cumulative | Step(cumulative)         | Step(prev) | Accrual    |
| ----- | ------------ | ---------- | ------------------------ | ---------- | ---------- |
| Jan   | 1,500,000    | 1,500,000  | 15,000                   | 0          | **15,000** |
| Feb   | 2,000,000    | 3,500,000  | 3M×1% + 500K×2% = 40,000 | 15,000     | **25,000** |
| Mar   | 2,500,000    | 6,000,000  | 3M×1% + 3M×2% = 90,000   | 40,000     | **50,000** |

---

#### Worked example 3 — Cumulative (bracket reached sets rate for whole amount)

**Contract:** annual, quarterly settlement. Brackets: 0–3M @ 1%, 3M–8M @ 2%, 8M+ @ 3%.

| Month | Monthly base | Cumulative | Step(cumulative)         | Step(prev) | Accrual     |
| ----- | ------------ | ---------- | ------------------------ | ---------- | ----------- |
| Jan   | 1,200,000    | 1,200,000  | 1,200,000 × 1% = 12,000  | 0          | **12,000**  |
| Feb   | 1,500,000    | 2,700,000  | 2,700,000 × 1% = 27,000  | 12,000     | **15,000**  |
| Mar   | 1,300,000    | 4,000,000  | 4,000,000 × 2% = 80,000  | 27,000     | **53,000**  |
| Apr   | 2,000,000    | 6,000,000  | 6,000,000 × 2% = 120,000 | 80,000     | **40,000**  |
| May   | 1,800,000    | 7,800,000  | 7,800,000 × 2% = 156,000 | 120,000    | **36,000**  |
| Jun   | 1,500,000    | 9,300,000  | 9,300,000 × 3% = 279,000 | 156,000    | **123,000** |

March jumps to **53,000** because crossing 3M bracket re-rates the entire cumulative. June jumps to **123,000** on crossing 8M. No retroactive correction — extra gain is fully captured in the month the bracket is crossed.

---

#### Worked example 4 — Paired DN/HU contract (Cumulative)

**Same bracket setup as example 3.**

| Month | DN base | HU base | Combined cumulative | Step(cumul) | Step(prev) | Total accrual | DN share | HU share |
| ----- | ------- | ------- | ------------------- | ----------- | ---------- | ------------- | -------- | -------- |
| Jan   | 700,000 | 500,000 | 1,200,000           | 12,000      | 0          | 12,000        | 7,000    | 5,000    |
| Feb   | 900,000 | 600,000 | 2,700,000           | 27,000      | 12,000     | 15,000        | 8,571    | 6,429    |
| Mar   | 0       | 0       | 2,700,000           | 27,000      | 27,000     | 0             | **0**    | **0**    |

March: both sides post 0. No division performed. Cumulative does not advance.

---

#### Idempotency enforcement

**DB layer:** partial unique index on `other_income_lists (contract_id, month) WHERE entry_type = 'monthly_accrual'`. Hard guard against races.

**Application layer:** before insert, check existence of `(contract_id, month, entry_type = 'monthly_accrual')`. If exists, return HTTP 409 with message "accrual already posted for this contract and month". Prevents the DB constraint from surfacing as a 500.

---

### TA-4: Confirm CN log design

**Status: DONE**

#### Decision: Defer CN log table

CN events currently have no single touchpoint — cancellations reach purchasing through scattered channels with no defined owner. Building a CN log now would require discipline that doesn't yet exist; a partially-maintained log gives false confidence and pollutes the accrual ledger.

**Deferred until purchasing establishes a defined CN intake process.**

#### What is kept in v2

- `cn_adjustment` entry_type remains in the schema — the slot exists when the process is ready.
- When eventually built: one CN log row per cancellation event, purchasing inputs `contract_id` + `order_numb` (always available) + `amount` + optional `supplier_ref` + `note`. System writes the `cn_adjustment` negative row to the accrual ledger at that point.
- Matching is clean — `order_numb` is always provided by the supplier.

---

### TA-3: Map the settlement / period-posting workflow

**Status: DONE**

#### Dropped tables

- `other_income_po_lists` — deprecated. Was an audit trail of which order lines fed the accrual. Too large for practical report use. Dropped in v2.
- `other_income_purchase_receipts` — same purpose, also dropped.

#### Settlement row schema (`other_income_periods` replacement) — updated per OQ-1

| Field                      | Type          | Notes                                                                                      |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `id`                       | INT PK        | —                                                                                          |
| `contract_id`              | INT           | One settlement per contract per period                                                     |
| `contract_type`            | NVARCHAR(10)  | `'ORDER'` \| `'BRANCH'` \| `'PROMO'`                                                      |
| `period_name`              | NVARCHAR(50)  | Human label e.g. "Q1 2026"                                                                 |
| `start_date`               | DATE          | First month included                                                                       |
| `end_date`                 | DATE          | Last month included                                                                        |
| `system_order_amount`      | DECIMAL(18,4) | SUM of `entry.order_amount` for picked entries. NULL for BRANCH/PROMO.                     |
| `cn_order_amount`          | DECIMAL(18,4) | SUM of `cn.order_amount` for picked CN rows. NULL for BRANCH/PROMO.                       |
| `system_income`            | DECIMAL(18,4) | `Step(system_order_amount − cn_order_amount)`. Computed and stamped at post time.          |
| `supplier_order_amount`    | DECIMAL(18,4) | Purchasing input from supplier statement. NULL for BRANCH/PROMO.                          |
| `supplier_income`          | DECIMAL(18,4) | `Step(supplier_order_amount)`. Computed and stamped at post time.                          |
| `cumulative_order_at_close`| DECIMAL(18,4) | Running total of corrected order base across all settlements 1..N for this contract. Seeds next settlement's bracket calculation. NULL for BRANCH/PROMO. |
| `remark`                   | NVARCHAR(MAX) | Free text for adhoc notes                                                                  |
| `created_at`               | DATETIME2     | —                                                                                          |

Unearned revenue = `supplier_income − system_income`. Derived by accounting report; not stored.

#### Settlement detail child rows (optional)

Bill-discount and free-item rows are optional. Only `supplier_order_amount` (ORDER type) or confirmation (BRANCH/PROMO) is required to post.

**`other_income_settlement_supplier_orders`** — optional supplier order line detail; rows sum to `supplier_order_amount`. Omitted when supplier provides a total only. FK to `settlement_id`. ORDER type only.
**`other_income_v2_bill_discounts`** — FK to `settlement_id`
**`other_income_v2_free_items`** — FK to `settlement_id`
**`other_income_v2_invoices`** + **`other_income_v2_receipts`** + **`other_income_v2_invoice_receipt_matches`** — FK to `settlement_id`
**`other_income_v2_credit_notes`** — FK to `settlement_id`

#### Workflow — atomic create-and-post

All steps execute in a single transaction. No draft state.

| Step | Actor      | Action                                                        | System writes                                                                                                           |
| ---- | ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Purchasing | Select income entry months to include                         | —                                                                                                                       |
| 2    | Purchasing | Review open CN rows for those months; confirm which to include| —                                                                                                                       |
| 3    | Purchasing | Enter `supplier_order_amount`                                 | —                                                                                                                       |
| 4    | Purchasing | Optionally append bill-discount / free-item / invoice detail  | —                                                                                                                       |
| 5    | Purchasing | Confirm post                                                  | Settlement row inserted with all computed amounts stamped                                                               |
| 6    | System     | Stamp income entry rows                                       | `settlement_id` set on all selected `other_income_income_entries` rows                                                  |
| 7    | System     | Stamp CN rows                                                 | `settlement_id` set on all selected `other_income_cn_orders` rows                                                       |

#### Correction path

Accounting deletes the settlement → system (in one transaction):

1. `UPDATE other_income_income_entries SET settlement_id = NULL WHERE settlement_id = @id`
2. `UPDATE other_income_cn_orders SET settlement_id = NULL WHERE settlement_id = @id`
3. Delete all child detail rows, then delete the settlement row

Purchasing then reposts from step 1.

---

### TA-1: Define the contract setup data model

**Status: DONE**

#### Contract table (`other_income_heads` replacement)

| v1 Field                                                                                                                                                    | v2 Field                          | Status      | Notes                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `event_id`                                                                                                                                                  | `contract_label_id`               | Changed     | FK to `other_income_contract_labels`                                                                     |
| `income_id`                                                                                                                                                 | `other_income_contract_income_types` junction | Changed     | One or more `(income_type, income_label_id)` rows per contract. Replaces single `income_id` FK.          |
| `comp_code`                                                                                                                                                 | `comp_code`                       | Keep        | —                                                                                                        |
| `comp_type`                                                                                                                                                 | `comp_type`                       | Keep        | DN/HU distinction is structural                                                                          |
| `period`                                                                                                                                                    | `settlement_period`               | Renamed     | 1/3/6/12 months                                                                                          |
| `start_date`                                                                                                                                                | `start_date`                      | Keep        | —                                                                                                        |
| `end_date`                                                                                                                                                  | `end_date`                        | Keep        | —                                                                                                        |
| `dual_pair_id`                                                                                                                                              | `supplier_pair_id`                | Changed     | FK to new `supplier_pairs` master-data table                                                             |
| `display_name`                                                                                                                                              | —                                 | **Dropped** | Unused in practice (700+ empty rows)                                                                     |
| `timestamp`                                                                                                                                                 | `created_at`                      | Renamed     | —                                                                                                        |
| `acc_amount`, `acc_income`, `rece_amount`, `inv_amount`, `order_amount`, `credit_amount`, `free_item_amount`, `bill_discount_amount` + all `_date` variants | —                                 | **Dropped** | Derivable running totals — replaced by "current state" view (TD-2) aggregating accrual + settlement rows |

#### DC/Rebate spec table (`other_income_not_light` replacement)

| v1 Field     | v2 Field                                | Status  | Notes                                                                                                                                                                |
| ------------ | --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step_type`  | `calc_type`: `Flat`/`Step`/`Cumulative` | Changed | Renamed to D365 Rebate Management terms. v1 `Flat(1)`→`Flat`, v1 `Semi(2)`→`Step` (rate per slice), v1 `Step(3)`→`Cumulative` (bracket rate applied to whole amount) |
| `cap_amount` | `cap_amount`                            | Keep    | Ceiling on order amount                                                                                                                                              |
| `inc_vat`    | `exclude_vat`                           | Changed | Renamed + logic inverted. `exclude_vat = true` means strip VAT before applying rate                                                                                  |
| `is_dc`      | `exclude_dc`                            | Changed | Renamed + logic clarified. Excludes DC-discount order lines from base amount                                                                                         |
| `is_rebate`  | `exclude_rebate`                        | Changed | Excludes rebate order lines                                                                                                                                          |
| `is_ince`    | `exclude_ince`                          | Changed | Excludes incentive order lines                                                                                                                                       |
| `is_comp`    | `exclude_comp`                          | Changed | Excludes comp order lines                                                                                                                                            |

All five `exclude_*` flags are **calculation logic** — they filter which order lines enter the base amount. They also appear on reports so purchasing/accounting can see the contract terms.

#### New master-data table: `supplier_pairs`

| Field          | Type      | Notes                    |
| -------------- | --------- | ------------------------ |
| `id`           | INT PK    | —                        |
| `dn_comp_code` | NVARCHAR  | FK to DNCompInfo         |
| `hu_comp_code` | NVARCHAR  | FK to CompInfo           |
| `display_name` | NVARCHAR  | Human label for the pair |
| `created_at`   | DATETIME2 | —                        |

- Permanent master data — created once, never recreated per contract.
- Only 6 pairs exist currently. Contracts reference this table via `supplier_pair_id`.
- Fixes the v1 pain: purchasing was re-creating the same DN/HU link for every 1–3 month contract. Now the supplier relationship is set once; contracts just reference it.
- Contract renewal (copy setup → new dates) is a UX fix handled at the API level, not a schema change.

#### Junction tables kept

- `other_income_head_incomes` — kept for multi-income support (junction between contract and income labels). The legacy `income_id` single FK on the head is deprecated; junction table is authoritative.
- `other_income_step_lists` — kept unchanged (bracket min/max/rate rows per contract)
- `other_income_products` — kept unchanged (included product filter per contract)
- `other_income_head_comps` — kept unchanged (multi-company support per contract)

---

### T0-4: Agree on materiality threshold and variance reporting

**Status: DONE**

- Accounting accepts two separate income figures: system accrual (estimate) and purchasing-adjusted accrual. They do not need to converge before posting.
- Materiality threshold: deferred — system is only 3 months old, insufficient data to set a number.
- Variance bridge report: read-only, accounting-facing only. Purchasing does not interact with it. Purchasing's position: "the in-house system lacks data and consistency — estimating income is almost always incorrect." They do not own the variance number.

### T0-5: Confirm settlement true-up mechanics

**Status: DONE**

#### Accrual row — one number only

Single `amount` field on the accrual row. The system-calculated estimate for that month, nothing else. The old v1 `cal_amount` / `actual_amount` split is dropped — month-on-month comparison is not feasible in practice and the two fields caused confusion.

#### Settlement row — where comparison lives

| Field            | Source           | Notes                                                                      |
| ---------------- | ---------------- | -------------------------------------------------------------------------- |
| `system_total`   | Auto-calculated  | Sum of all `picked` `monthly_accrual` rows included in this settlement     |
| `supplier_total` | Purchasing input | Authoritative figure from supplier PDF. Required.                          |
| `trueup_delta`   | Auto-calculated  | `supplier_total − system_total`. Drives the `settlement_trueup` dual rows. |

#### Settlement detail rows (optional)

Bill-discount and free-item detail rows are optional child rows on the settlement. Purchasing inputs as much detail as available for audit purposes. Only `supplier_total` is required to post.

If supplier PDF has line-item detail: purchasing inputs value + order number and/or line items.
If supplier PDF has total only: purchasing inputs total only. Detail appended later if obtained.

#### Supplier total is authoritative

Quarterly/half-yearly/annual supplier PDF provides total only (no monthly breakdown guaranteed). Supplier total is the settlement figure — the system does not attempt to distribute it across months.
