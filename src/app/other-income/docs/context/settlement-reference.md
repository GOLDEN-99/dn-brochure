# Settlement & Income Entry — Current Design Reference

Supersedes the CN/settlement portions of `decisions.md` and all of
`settlement-cumulative-bug-discussion.md`, which describe a pre-redesign
architecture (see "Superseded" section at the bottom for what changed and why).
For API request/response shapes, `docs/settlement-api.md` and
`docs/income-entry-api.md` remain the source of truth — this file explains the
model behind them.

## 1. Income entries are the single ledger — no separate CN/correction table

`other_income_income_entries` holds every row that feeds a settlement: the
monthly `AUTO` estimate plus any number of correction rows, distinguished by
`entry_type`:

| entry_type          | Purpose                                                                          |
| -------------------- | --------------------------------------------------------------------------------- |
| `AUTO`               | System-generated monthly estimate. One per `(contract_id, contract_type, month)`. |
| `CN_CORRECTION`      | Returned-product credit note. Carries a **negative** `order_amount`.              |
| `LAG_CORRECTION`     | Supplier declared an amount before the system's own data caught up. Dual-insert: `+amount` in month `m`, mirrored `-amount` in `m+1`. |
| `MANUAL_CORRECTION`  | Fallback for cases the system can't auto-correct.                                 |

Corrections carry a **signed** `order_amount`. Settlement just sums every
picked entry — no special-case subtraction anywhere downstream. There is no
`other_income_cn_orders` table and no separate `CnOrderIds` list on
`CreateSettlementRequest`; picking a `CN_CORRECTION` entry's id into
`incomeEntryIds` is sufficient to settle it.

Item-level detail (which good codes/order numbers make up a correction) lives
in audit-only child tables keyed by the entry itself — `other_income_cn_correction_items`,
`other_income_lag_correction_items` — never read by the income calculation.

## 2. Settlement computation

```
systemOrderAmount  = Σ orderAmount of picked entries where entryType IN (AUTO, CN_CORRECTION, MANUAL_CORRECTION)
cnOrderAmount      = -Σ orderAmount of picked entries where entryType = CN_CORRECTION
                      (display-only, derived — not a separate input)
lagOffset          = Σ orderAmount of picked entries where entryType = LAG_CORRECTION
supplierOrderAmount = req.SupplierOrderAmount + lagOffset

cumulativeBefore = GetPreviousCumulativeOrderAsync(contractId, contractType) ?? 0
cumulativeAfter  = cumulativeBefore + systemOrderAmount

systemIncome   = Step(cumulativeAfter) - Step(cumulativeBefore)
supplierIncome = Step(cumulativeBefore + supplierOrderAmount) - Step(cumulativeBefore)

cumulativeOrderAtClose = cumulativeAfter
```

`LAG_CORRECTION` entries move to the supplier side: their signed `orderAmount` adjusts
`supplierOrderAmount` rather than `systemOrderAmount`. `systemOrderAmount` is now strictly
what we received and recorded. `GetCumulativeOrderAmountBeforeAsync` uses the same
`AUTO/CN_CORRECTION/MANUAL_CORRECTION` filter so the monthly auto-estimate's cumulative
base stays consistent with what settlement produces.

`Step()` brackets are keyed off **contract-to-date cumulative total**, not the
settlement period's own slice — income is always the delta between the
bracket value before and after this settlement's order amount. This applies
identically to the monthly `AUTO` estimate (`IncomeEntryService.AutoCreateForOrderAsync`),
which uses the same cumulative-before/after shape so interim reporting and
final settlement use consistent math.

`rate` on bracket rows is stored as a whole-number percent (e.g. `3` means
3%) — divide by 100 when applying, for all three calc types (`Flat`, `Step`,
`Cumulative`).

## 3. `supplier_order_amount` — manual input, not computed (line-item detail removed)

`supplier_order_amount` is what the **supplier's own statement** says was
billed for the period — entered manually by Purchasing. It is deliberately
never derived from our own order/contract data: the entire purpose of having
both `system_order_amount` (our accrual) and `supplier_order_amount` (their
claim) on the same settlement row is to detect mismatches between the two.
Computing one from the other would make the cross-check meaningless.

**`SupplierOrders` / `other_income_settlement_supplier_orders` removed
(2026-06-26).** This was the itemized line-item breakdown backing
`supplier_order_amount` — which specific received orders the supplier's
statement said were included in the period. It was never migrated (flagged
`-- skip` and not added to `DatabaseMigrator.cs`), and the decision was made
to drop it entirely rather than reconcile the gap: `SupplierOrderInput`/
`SupplierOrder` were removed from `CreateSettlementRequest`,
`SettlementResponse`, the domain entities, and `ISettlementRepository`/
`SettlementRepository` (`InsertSupplierOrdersAsync`/`GetSupplierOrdersAsync`).
`supplier_order_amount` itself (the aggregate decimal on the settlement row)
is unaffected — only the line-item detail table/code is gone.

**Known bug in `SearchOrdersAsync`** (`OrderContractRepository.cs`): excludes
`orderStat = '4'` (not received), which is backwards for both consumers —
lag correction specifically needs not-yet-received orders, and partial
fulfillment means `allTotal` alone (no join against `HistStockRece`) doesn't
reflect what's actually outstanding. Needs a join against the receipt table,
summed per `orderNumb`, to expose received/remaining amounts.

**Receipts and invoice-receipt matches removed from settlement creation
(2026-06-26).** `CreateSettlementRequest` no longer accepted `Receipts`/
`InvoiceReceiptMatches` — only `Invoices` (plus bill discounts, free items,
credit notes) at that point. Receipts and matches are added via
`POST /v2/settlements/{id}/invoices`, which accepts invoices, receipts, and
matches together.

**Bill discounts, free items, invoices, and credit notes removed from
settlement creation (2026-07-02).** `CreateSettlementRequest` no longer
accepts any of the four supporting-document types — creation now only picks
income entries (`incomeEntryIds`) and writes the settlement header row.
Every settlement, regardless of contract type, is created bare and all
documents are appended afterward via `POST /v2/settlements/{id}/invoices`,
`/bill-discounts`, `/free-items`, and `/credit-notes`. This removes the
asymmetry where BRANCH's auto-settle-on-add-branch flow
(`BranchContractService.AddBranchWithAccrualAsync`) always passed empty
lists for these fields while ORDER/PROMO could optionally bundle them at
create time — now all three contract types follow the same
create-then-append shape. `SettlementResponse` (`GET /v2/settlements/{id}`)
and the underlying repository/entities are unchanged — this trims the
*create* payload only, not the feature.

## 4. State model

- `settlement_id` stamp on `other_income_income_entries`: `NULL` = open,
  `NOT NULL` = picked. One-way transition, reversed only by deleting the
  settlement.
- No draft state — settlement create-and-post is one atomic transaction.
- Delete settlement → entries revert to open, child detail rows deleted,
  settlement row deleted → Purchasing reposts from scratch.

### 4.1 Post-creation states — balance vs. review (added 2026-07-01)

Once a settlement exists, it carries two **independent** state dimensions,
surfaced via `GET /v2/settlements/overview` (see `docs/settlement-api.md`).
Do not conflate them — one is computed, the other is a workflow flag:

- **`balanceState`** — computed at query time, never stored.
  `remaining = supplierIncome - (Σ invoice + Σ creditNote + Σ billDiscount + Σ freeItem)`
  across all four child tables jointly (a settlement isn't restricted to
  one income type — whatever mix gets appended counts toward the same
  threshold). `OUTSTANDING` if `remaining > 1`, else `SETTLED`.
- **`reviewState`** — a workflow flag, stored as `reviewed_at`/`reviewed_by`
  on `other_income_settlements` (nullable; `NULL` = `UNREVIEWED`). Set only
  by the explicit `POST /v2/settlements/{id}/review` action — never
  derived from amounts. A settlement is typically `SETTLED` +
  `UNREVIEWED` right after the last document is posted; accounting's
  review (checking appended order numbers/documents against what the
  supplier actually sent) is a separate, later step. No code enforces
  `balanceState = SETTLED` before allowing review — that's a judgment
  call, not a system gate.

Invoices additionally carry a per-row `invoiceState` (`UNMATCHED` if
`invoiceAmount - Σ matchedAmount > 1`, else `MATCHED`), surfaced via `GET
/v2/settlements/invoice-states`. This is separate from `balanceState`
because invoice-receipt matching has its own remediation workflow (chasing
the receipt) and its own frontend view, independent of whether the
settlement as a whole has reconciled.

## 5. Superseded documents

- **`settlement-cumulative-bug-discussion.md`** — entirely superseded. It
  documents the `other_income_cn_orders` separate-table design (§5, §6, §7)
  and a `cumulativeBefore`-ignoring bug (§9) that has since been fixed (see
  §2 above, which already reflects the fix). Safe to delete.
- **`decisions.md`** — the **CN/settlement-specific** sections are stale and
  contradict current code/docs: the table inventory entry for
  `other_income_cn_orders`, OQ-1's CN-related rows, T0-3's "Entry row state"
  section, TA-3's "Stamp CN rows" workflow step and reversal SQL. These
  describe the pre-redesign architecture. The **non-CN** content in
  `decisions.md` (Track B/C designs, TA-1/TA-2/TA-5 schema and API tables,
  T0-1/T0-4/T0-5) is still accurate and unrelated to this change — only the
  CN-specific passages should be removed or flagged, not the whole file.
