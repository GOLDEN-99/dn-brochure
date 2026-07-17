# Supplier-side lag correction — design proposal (2026-06-26)

Status: **IMPLEMENTED (2026-07-01).** Three code changes applied:
- `V2/Service/SettlementService.cs` — aggregation split by `entry_type`
- `V2/Repository/IncomeEntryRepository.cs` — `GetCumulativeOrderAmountBeforeAsync` excludes `LAG_CORRECTION`
- `Service/DatabaseMigrator.cs` — `vw_other_income_accrual_state` excludes `LAG_CORRECTION`

**No table schema changes required.** `other_income_settlements.supplier_order_amount`
is already a plain `DECIMAL(18,4) NULL` column (`migration/2026-06-04-other-income-v2.sql`)
that stores whatever value `SettlementService.CreateAsync` computes before
insert — this proposal only changes *what value* gets computed
(`req.SupplierOrderAmount + supplierOrderOffset` instead of
`req.SupplierOrderAmount` alone), not the column itself.
`other_income_income_entries.entry_type = 'LAG_CORRECTION'` already exists
as a value — no new column/table needed there either. The only
schema-adjacent change is `vw_other_income_accrual_state`'s view definition
(a `WHERE` clause addition, not a column add/drop — see §6.2a). Everything
else is C# aggregation-logic only.

## 1. The problem with today's model

`LAG_CORRECTION` entries currently live in `other_income_income_entries`,
indistinguishable from `AUTO`/`CN_CORRECTION`/`MANUAL_CORRECTION` at
settlement-sum time:

```csharp
systemOrderAmount = entries.Sum(e => e.OrderAmount ?? 0m);   // SettlementService.cs:75
```

This sums *every* picked entry's signed `OrderAmount` into
`systemOrderAmount`, including lag rows. That means lag corrections currently
adjust **our own books**, on the theory that "the supplier shipped it, our
data hasn't caught up, so let's add it to our estimate early and reverse it
next month."

## 2. Why that's the wrong side, per this session's discussion

The actual distinction driving these two numbers:

- **`systemOrderAmount`** = what *we* received and recorded. Built purely
  from our own order/receipt data (`HistStockOrder`/`HistStockRece`), plus
  `CN_CORRECTION`/`MANUAL_CORRECTION` to fix our own recording errors.
  Accounting accepts this number **as-is** once those corrections are
  applied — there is deliberately no further adjustment for timing, because
  "received and recorded" is exactly what this number is supposed to mean.
  If we haven't received something yet, it correctly does not appear here.

- **`supplierOrderAmount`** = what the *supplier* declares, dated by when
  *they* shipped — which runs ahead of our own receipt timeline. The lag is
  a property of the supplier's declaration, not of our bookkeeping. Adding a
  lag entry to `systemOrderAmount` mixes "what we received" with "what they
  say they shipped," contaminating the one number that's supposed to be
  clean-and-accepted-as-is.

- **The system/supplier gap is the entire point.** Per `decisions.md` T0-4:
  *"Accounting accepts two separate income figures... they do not need to
  converge before posting."* The difference (`supplierIncome −
  systemIncome`) is unearned revenue, carried forward as a number accounting
  reviews — not an error to eliminate. Polluting `systemOrderAmount` with
  lag noise corrupts the very comparison this design exists to produce.

**Direction: lag corrections should adjust `supplierOrderAmount`, not
`systemOrderAmount`.** `systemOrderAmount` becomes strictly
`AUTO + CN_CORRECTION + MANUAL_CORRECTION` — our own recorded data, corrected
only for our own recording errors.

## 3. Why this is a bigger change than swapping a sum

`supplierOrderAmount` today is **not a ledger** — it's a single manually
typed `decimal` on `CreateSettlementRequest`, entered fresh by Purchasing at
each settlement's creation (`req.SupplierOrderAmount`, `SettlementService.cs:77`).
There is no concept of "carry an adjustment from this settlement into the
next one." The lag pattern (`+amount` this period, `−amount` next period)
requires exactly that carry-forward, because the two halves of one lag event
land in different settlement periods.

Today's `+/−` pair works because both halves are rows in the same
`other_income_income_entries` table, picked independently into whichever
settlement happens to cover that month — the ledger does the carrying for
free. Moving lag to the supplier side means **either**:

- **(a)** keep lag as income-entry rows, but tag them so settlement sums
  them into `supplierOrderAmount` instead of `systemOrderAmount` when
  picked — minimal schema change, reuses the existing entry/settlement-pick
  machinery, but is conceptually odd (an "income entry" describing the
  supplier's declaration, not our income).
- **(b)** give lag corrections their own ledger, parallel to income entries
  but explicitly modeling the supplier's declared-shipment timeline,
  independent of `other_income_income_entries`. Cleaner conceptually, more
  schema/code to build.

Recommendation: **(a)** to start. It reuses the entry_type discriminator
pattern that already exists, reuses settlement-pick stamping, and the
"this is the supplier's number, not ours" distinction can live in how
`SettlementService` sums by `entry_type` rather than in a new table. Revisit
(b) only if lag volume/complexity grows enough to justify a dedicated model.

## 4. Proposed mechanics

```
systemOrderAmount   = Σ orderAmount of picked entries where entryType IN (AUTO, CN_CORRECTION, MANUAL_CORRECTION)
supplierOrderOffset = Σ orderAmount of picked entries where entryType = LAG_CORRECTION
supplierOrderAmount = req.SupplierOrderAmount + supplierOrderOffset
```

- `req.SupplierOrderAmount` stays exactly as today — Purchasing's manual
  transcription of the supplier's statement for *this* period.
- `supplierOrderOffset` is the lag pair's contribution for whichever lag
  entries get picked into *this* settlement — naturally signed, so the
  extraction month's settlement picks up `+amount` and the following
  month's settlement (whenever it's created) picks up the mirrored
  `−amount`, exactly mirroring how CN/manual already net into
  `systemOrderAmount` today. No new carry-forward machinery needed — this
  reuses the existing settlement-pick stamping, just summed into a
  different bucket.
- `supplierIncome` then runs through the same `Step()` bracket-delta math
  as today, just using the adjusted `supplierOrderAmount`.

This is structurally identical to today's pattern — only the **bucket each
entry_type sums into** changes. `LAG_CORRECTION` moves from the
`systemOrderAmount` sum to a new `supplierOrderAmount`-adjustment sum.
`CreateLagCorrectionAsync`'s existing dual-insert (+amount this month,
−amount next month) and its per-line item audit table need no schema
change — only `SettlementService.CreateAsync`'s aggregation logic changes.

## 5. Unearned revenue — already correctly modeled, just confirm intent

Per `decisions.md` T0-4/T0-5 and `settlement-reference.md` §2, `system_income`
and `supplier_income` are both stored per settlement, and
`unearned revenue = supplier_income − system_income` is **derived by
accounting report, not stored** as a running balance. This already matches
"we accept our number, mark what supplier paid over our number as unearned
revenue" — no schema change needed here, assuming the report layer
(`ReportController`/`ReportRepository`) already surfaces this delta per
settlement. **Action: confirm the existing report actually computes and
displays this delta** before assuming it's covered — this doc doesn't verify
that independently.

## 6. Open decisions before implementation

1. **Confirm option (a) vs (b) above** — reuse `other_income_income_entries`
   with a resummed bucket, or build a separate supplier-declaration ledger.
2. **`CreateLagCorrectionAsync`'s own income-effect calculation — resolved,
   no change needed.** `IncomeEntryService.cs:171-175` computes `monthDelta`
   against `GetCumulativeOrderAmountBeforeAsync` (an all-entries-ever-recorded
   running total, recomputed fresh each time). This was already a
   **discardable estimate** even before this proposal — same as an `AUTO`
   entry's `Amount` field, per the existing comment at
   `settlement-cumulative-bug-discussion.md` (superseded, but the principle
   carries over): "Settlement never sums individual entries' precomputed
   `Amount`... only `OrderAmount` survives into the real calculation." So
   `monthDelta` can keep being computed exactly as today; it's never read at
   settlement time regardless of which bucket the entry's `OrderAmount` lands
   in. The only code that changes is `SettlementService.CreateAsync`'s
   aggregation step (§4 above) — add `LAG_CORRECTION.OrderAmount` into the
   `supplierOrderAmount` figure *before* that figure is run through `Step()`
   against `prevCumulative`, reusing the system's existing cumulative base
   (`GetPreviousCumulativeOrderAsync`) exactly as `supplierIncome`'s formula
   already does today. No new cumulative tracking needed for the supplier
   side.
2a. **Found while resolving #2 — `GetCumulativeOrderAmountBeforeAsync` must
   exclude `LAG_CORRECTION`. This IS a required code change, not optional.**
   This function sums `order_amount` across **every entry, any `entry_type`,
   unfiltered** (`IncomeEntryRepository.cs:140-147`) — it currently includes
   lag rows from prior months. It's used by:
   - `AutoCreateForOrderAsync` (`IncomeEntryService.cs:67`) — the **monthly
     auto-insert job and the backfill path both call this same function**,
     so both are affected identically; no special-casing needed between them.
   - `CreateLagCorrectionAsync`/`CreateCnCorrectionAsync` themselves, for
     their own discardable `monthDelta` (per #2, not load-bearing).

   Once `systemOrderAmount` is redefined as `AUTO + CN_CORRECTION +
   MANUAL_CORRECTION` (excluding lag), the cumulative base feeding that same
   number's bracket math must use the identical filter — otherwise the
   monthly estimate measures movement on a base the final settlement doesn't
   actually use, silently drifting from what settlement produces. Required
   fix:

   ```sql
   SELECT ISNULL(SUM(order_amount), 0)
   FROM other_income_income_entries
   WHERE contract_id   = @ContractId
     AND contract_type = @ContractType
     AND month         < @Month
     AND entry_type IN ('AUTO', 'CN_CORRECTION', 'MANUAL_CORRECTION')
   ```

   `GetPreviousCumulativeOrderAsync` (`SettlementRepository.cs:192`, used by
   settlement) needs **no filter change** — it reads `cumulative_order_at_close`,
   which is already computed from the corrected `systemOrderAmount`, so it's
   automatically consistent once `SettlementService`'s aggregation (§4) is
   fixed.

   **Confirmed: `vw_other_income_accrual_state` also needs this filter.**
   Checked its live definition in `Service/DatabaseMigrator.cs:71-83` (the
   `.sql` spec file under `migration/` is stale for this view — the
   migrator's inline SQL is what's actually deployed). The view sums
   `order_amount`/`amount` across **every entry, no `entry_type` filter at
   all**, grouped by `(contract_id, contract_type, month)`:

   ```sql
   SELECT e.contract_id, e.contract_type, e.month
        , SUM(e.order_amount) AS net_order_amount
        , SUM(e.amount)       AS estimate_income
   FROM other_income_income_entries e
   GROUP BY e.contract_id, e.contract_type, e.month
   ```

   This backs `GET /v2/report/accrual-state` (`ReportRepository.cs:25-53`,
   `IReportRepositoryV2.GetAccrualStateAsync`) — the accounting-facing
   interim report `net_order_amount`/`estimate_income` per contract/month.
   Without a fix, accounting would see a `LAG_CORRECTION`-polluted system
   number here even after the cumulative function and `SettlementService`
   are corrected, since this is an independent SQL aggregation with its own
   `entry_type` blind spot. Required fix: add
   `WHERE e.entry_type IN ('AUTO', 'CN_CORRECTION', 'MANUAL_CORRECTION')` to
   the view (update the migrator's inline SQL, since that's the live
   source).
3. **API/doc surface** — `entry_type = LAG_CORRECTION` is currently
   documented (`income-entry-api.md`) as a system-side correction
   alongside CN/manual. Docs need updating once the summing logic changes,
   so callers understand lag entries are picked into settlements the same
   way but land in a different output field.
4. **Existing data** — any `LAG_CORRECTION` entries already created and
   settled under the old (system-side) summing would have already
   contributed to a settled `systemOrderAmount`/`systemIncome`. Decide
   whether this is a forward-only behavior change (only affects future
   settlements) or needs a backfill/correction pass for already-posted
   settlements.
