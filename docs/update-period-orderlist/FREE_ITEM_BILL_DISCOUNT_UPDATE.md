# Free Item & Bill Discount Separation — Frontend Update Guide

**Date:** 2026-03-17
**Migration Required:** Yes — run `migration/2026-03-17-separate-po-entities.sql`

---

## What Changed

Previously, both free items (ของแถม) and bill discounts (ส่วนลดบิล) were recorded together under a single `orderAmount` field and a shared `POST /period/{id}/order` endpoint. They are now separate entities with their own endpoints and their own amount breakdowns.

### New fields on `PeriodDto`

```typescript
interface PeriodDto {
  // ... existing fields unchanged ...
  orderAmount: number;      // kept — total of freeItemAmount + billDiscountAmount (transition period)
  orderDate: string | null; // kept — date of last order entry of any type

  // ✨ NEW
  freeItemAmount: number;
  billDiscountAmount: number;
}
```

### New collections on `PopulatedPeriod` (period detail response)

```typescript
interface BaseFreeItem {
  id: number;
  orderNumb: string;
  actualAmount: number;
  supInvNumb: string;
  supInvDate: string | null;
  receNumb: string;
}

interface BaseBillDiscount {
  id: number;
  orderNumb: string;
  actualAmount: number;
  supInvNumb: string;
  supInvDate: string | null;
  receNumb: string;
}

interface PopulatedPeriod extends PeriodDto {
  orderList: BaseOrder[];       // kept — legacy entries from old /order endpoint
  freeItemList: BaseFreeItem[];      // ✨ NEW
  billDiscountList: BaseBillDiscount[]; // ✨ NEW
  invoiceList: BaseInvoice[];
  receiptList: BaseReceipt[];
  creditList: CreditNoteRecord[];
}
```

---

## New Endpoints

### Insert free item
```
POST /period/{periodId}/free-item
```
**Request body:**
```typescript
interface InsertFreeItemReq {
  orderNumb: string;
  receNumb: string;
  actualAmount: number;
  remark: string;
}
```
**Response:** `{ id: number }`

---

### Insert bill discount
```
POST /period/{periodId}/bill-discount
```
**Request body:**
```typescript
interface InsertBillDiscountReq {
  orderNumb: string;
  receNumb: string;
  actualAmount: number;
  remark: string;
}
```
**Response:** `{ id: number }`

---

### Delete free item
```
DELETE /period/{periodId}/free-item/{freeItemId}
```
**Response:** `204 No Content`

---

### Delete bill discount
```
DELETE /period/{periodId}/bill-discount/{billDiscountId}
```
**Response:** `204 No Content`

---

## Kept Unchanged

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /period/{id}/order` | **Kept** | Still works, still writes to old `other_income_po_lists`. Use for legacy data only. |
| `DELETE /period/{id}/order` | N/A | Was never exposed — delete via new endpoints |
| All invoice, receipt, credit note endpoints | **Unchanged** | No changes |
| `orderAmount` field | **Kept** | Still returned as the running total. Will be removed in a future migration once old `/order` data is migrated. |

---

## What Frontend Should Do

### Phase 1 — Required changes

- [ ] **Update `PeriodDto` interface** — add `freeItemAmount` and `billDiscountAmount` fields
- [ ] **Update `PopulatedPeriod` interface** — add `freeItemList` and `billDiscountList` arrays
- [ ] **Replace `POST /period/{id}/order` calls** for free item submissions → `POST /period/{id}/free-item`
- [ ] **Replace `POST /period/{id}/order` calls** for bill discount submissions → `POST /period/{id}/bill-discount`
- [ ] **Update delete logic** — use `/free-item/{id}` or `/bill-discount/{id}` for new entries
- [ ] **Update period detail view** — render `freeItemList` and `billDiscountList` as separate sections instead of a single `orderList`

### Phase 2 — Display improvements (optional but recommended)

- [ ] Show `freeItemAmount` and `billDiscountAmount` as separate line items in the period summary card
- [ ] Keep `orderAmount` display during transition (it equals `freeItemAmount + billDiscountAmount + legacy orderList amount`)
- [ ] Add section labels: **"ของแถม"** for `freeItemList`, **"ส่วนลดบิล"** for `billDiscountList`

---

## Amount Relationship (during transition)

```
orderAmount = freeItemAmount + billDiscountAmount + (sum of legacy orderList entries)
```

Once all old `/order` data is migrated and the `orderList` is empty, `orderAmount` will equal `freeItemAmount + billDiscountAmount` exactly — at that point `orderAmount` will be removed.

---

## Migration Checklist

- [ ] Run `migration/2026-03-17-separate-po-entities.sql` on the database before deploying the new API
- [ ] Verify `GET /otherIncome/{id}` returns `freeItemList` and `billDiscountList` arrays (may be empty for existing periods)
- [ ] Verify `freeItemAmount` and `billDiscountAmount` are `0` for all existing periods (correct — migration adds columns with DEFAULT 0)

---

**Document Version:** 1.0
**Last Updated:** 2026-03-17
