# Period Status Management - Frontend Update Guide

**Date:** 2026-01-09
**Backend Version:** v2.0 (Period Status Enhancement)
**Migration Required:** Yes

---

## Overview

The backend has been updated to support **amount-based period status tracking** for Invoice and Credit Note periods. This replaces the previous date-based status logic with a more accurate system that tracks gradual bill/invoice/receipt addition.

### What Changed

**Before:**
- Status determined by date presence (e.g., `invoice_date IS NOT NULL`)
- Status changed immediately when ANY invoice/receipt was added
- No support for gradual addition tracking

**After:**
- Status determined by amount comparisons
- Status changes when amounts match expected totals
- Supports gradual addition (multiple invoices/receipts)
- Manual override API for tolerance handling

---

## Breaking Changes

### ⚠️ Period Response Schema Changes

The `PeriodDto` object now includes a new optional field:

```typescript
interface PeriodDto {
  id: number;
  periodName: string;
  totalAmount: number;
  totalIncome: number;
  startDate: string;
  endDate: string;
  receAmount: number;
  receDate: string | null;
  invAmount: number;
  invDate: string | null;
  orderAmount: number;
  orderDate: string | null;
  creditAmount: number;
  creditDate: string | null;
  periodRemark: string;

  // ✨ NEW FIELD
  periodStatus?: PeriodStatus | null;  // 1=All, 2=Complete, 3=Invoice, 4=Receipt
}
```

### ⚠️ Status Determination Logic

**Previous Logic (DEPRECATED):**
```typescript
// OLD - Based on date presence
function getPeriodStatus(period: PeriodDto): string {
  if (period.receDate && period.invDate) return 'Complete';
  if (period.invDate) return 'Receipt';
  return 'Invoice';
}
```

**New Logic (CURRENT):**
```typescript
// NEW - Use periodStatus field directly
function getPeriodStatus(period: PeriodDto): string {
  switch (period.periodStatus) {
    case 2: return 'Complete';
    case 3: return 'Invoice';
    case 4: return 'Receipt';
    default: return 'Unknown';
  }
}
```

---

## New Features

### 1. New Endpoint: Update Period Status (Manual Override)

**Endpoint:** `PATCH /period/{periodId}/status`

Use this endpoint to manually override the period status (e.g., for tolerance handling when amounts differ by small amounts like 0.01).

**Request:**
```typescript
interface UpdateStatusReq {
  Status: PeriodStatus;  // 2=Complete, 3=Invoice, 4=Receipt
}
```

**Example:**
```typescript
async manuallyMarkAsComplete(periodId: number) {
  const result = await firstValueFrom(
    this.http.patch(
      `${environment.oi}/period/${periodId}/status`,
      { Status: 2 }  // 2 = Complete
    )
  );

  if (result) {
    this.toastService.success('อัปเดตสถานะสำเร็จ');
  }
}
```

**Response:**
- `200 OK` - Status updated successfully
- `404 Not Found` - Period not found or not an Invoice/CreditNote type

---

## Updated Workflows

### Period Status Display

Update your period display components to use the new `periodStatus` field:

**Old Implementation:**
```typescript
@Component({
  template: `
    <div class="status-badge" [class]="getStatusClass(period)">
      {{ getStatusLabel(period) }}
    </div>
  `
})
export class PeriodCardComponent {
  getStatusLabel(period: PeriodDto): string {
    // OLD - Based on dates
    if (period.receDate && period.invDate) return 'เสร็จสิ้น';
    if (period.invDate) return 'รอใบเสร็จ';
    return 'รอใบแจ้งหนี้';
  }

  getStatusClass(period: PeriodDto): string {
    if (period.receDate && period.invDate) return 'badge-success';
    if (period.invDate) return 'badge-warning';
    return 'badge-info';
  }
}
```

**New Implementation:**
```typescript
@Component({
  template: `
    <div class="status-badge" [class]="getStatusClass(period)">
      {{ getStatusLabel(period) }}
    </div>
  `
})
export class PeriodCardComponent {
  getStatusLabel(period: PeriodDto): string {
    // NEW - Use periodStatus field
    switch (period.periodStatus) {
      case 2: return 'เสร็จสิ้น';
      case 4: return 'รอใบเสร็จ';
      case 3: return 'รอใบแจ้งหนี้';
      default: return '-';
    }
  }

  getStatusClass(period: PeriodDto): string {
    switch (period.periodStatus) {
      case 2: return 'badge-success';
      case 4: return 'badge-warning';
      case 3: return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}
```

---

### Period Filtering

The existing filter query parameter continues to work, but now uses the new status column:

**Endpoint:** `GET /period/{compType}?filter={statusCode}`

**Filter Codes:**
- `1` - All periods
- `2` - Complete (both invoice and receipt completed)
- `3` - Invoice (waiting for invoice)
- `4` - Receipt (waiting for receipt)

**Example:**
```typescript
// Get all Invoice periods waiting for invoices
async getInvoicePeriods(compType: string) {
  const periods = await firstValueFrom(
    this.http.get<PeriodDto[]>(
      `${environment.oi}/period/${compType}`,
      { params: { filter: '3' } }  // 3 = Invoice status
    )
  );
  return periods;
}

// Get all periods waiting for receipts
async getReceiptPeriods(compType: string) {
  const periods = await firstValueFrom(
    this.http.get<PeriodDto[]>(
      `${environment.oi}/period/${compType}`,
      { params: { filter: '4' } }  // 4 = Receipt status
    )
  );
  return periods;
}

// Get all completed periods
async getCompletePeriods(compType: string) {
  const periods = await firstValueFrom(
    this.http.get<PeriodDto[]>(
      `${environment.oi}/period/${compType}`,
      { params: { filter: '2' } }  // 2 = Complete
    )
  );
  return periods;
}
```

---

### Handling Gradual Invoice/Receipt Addition

The new system automatically tracks gradual addition. Your existing code for adding invoices/receipts **does not need changes**, but the status behavior is now more accurate:

**Scenario: Adding Multiple Invoices**

```typescript
async addInvoicesGradually(periodId: number) {
  // Period: total_income = 10,000

  // Add first invoice (3,000)
  await firstValueFrom(
    this.periodService.insertInv(periodId, {
      invNumb: 'INV-001',
      invDate: '2026-01-15T00:00:00',
      invAmount: 3000,
      invRemark: 'ใบแจ้งหนี้งวดที่ 1'
    })
  );
  // Status: 3 (Invoice) - Still waiting, only 3,000/10,000

  // Add second invoice (3,000)
  await firstValueFrom(
    this.periodService.insertInv(periodId, {
      invNumb: 'INV-002',
      invDate: '2026-01-20T00:00:00',
      invAmount: 3000,
      invRemark: 'ใบแจ้งหนี้งวดที่ 2'
    })
  );
  // Status: 3 (Invoice) - Still waiting, only 6,000/10,000

  // Add third invoice (4,000)
  await firstValueFrom(
    this.periodService.insertInv(periodId, {
      invNumb: 'INV-003',
      invDate: '2026-01-25T00:00:00',
      invAmount: 4000,
      invRemark: 'ใบแจ้งหนี้งวดที่ 3'
    })
  );
  // Status: 4 (Receipt) - Now complete! 10,000/10,000

  // Refetch to see updated status
  const updatedPeriod = await this.periodService.getById(periodId);
  console.log('Status:', updatedPeriod.periodStatus); // 4 = Receipt
}
```

---

### Manual Status Override UI

Add a UI component to allow users to manually override status for edge cases:

```typescript
@Component({
  selector: 'app-period-status-override',
  template: `
    <div class="status-override-panel" *ngIf="showOverride">
      <h5>อัปเดตสถานะด้วยตนเอง</h5>
      <p class="text-muted">
        ใช้เมื่อยอดเงินแตกต่างเล็กน้อย (เช่น 0.01 บาท) และต้องการปิด Period
      </p>

      <div class="amount-summary">
        <div>ยอดรวมที่คาดหวัง: {{ period.totalIncome | number:'1.2-2' }}</div>
        <div>ยอด Invoice: {{ period.invAmount | number:'1.2-2' }}</div>
        <div>ยอดใบเสร็จ: {{ period.receAmount | number:'1.2-2' }}</div>
        <div class="text-danger" *ngIf="difference > 0">
          ส่วนต่าง: {{ difference | number:'1.2-2' }} บาท
        </div>
      </div>

      <button
        class="btn btn-primary"
        (click)="markAsComplete()"
        [disabled]="loading">
        <span *ngIf="!loading">บังคับปิด Period</span>
        <span *ngIf="loading">กำลังอัปเดต...</span>
      </button>
    </div>
  `
})
export class PeriodStatusOverrideComponent {
  @Input() period!: PeriodDto;
  @Input() showOverride = false;

  loading = false;

  private http = inject(HttpClient);
  private toast = inject(ToastService);

  get difference(): number {
    return Math.abs(this.period.invAmount - this.period.receAmount);
  }

  async markAsComplete() {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะบังคับปิด Period นี้?')) {
      return;
    }

    this.loading = true;

    try {
      await firstValueFrom(
        this.http.patch(
          `${environment.oi}/period/${this.period.id}/status`,
          { Status: 2 }  // 2 = Complete
        )
      );

      this.toast.success('อัปเดตสถานะเป็น "เสร็จสิ้น" สำเร็จ');

      // Emit event to parent to refetch data
      this.statusUpdated.emit();

    } catch (error) {
      console.error('Failed to update status:', error);
      this.toast.danger('ไม่สามารถอัปเดตสถานะได้');

    } finally {
      this.loading = false;
    }
  }

  @Output() statusUpdated = new EventEmitter<void>();
}
```

---

## Type Definitions

### PeriodStatus Enum

```typescript
enum PeriodStatus {
  All = 1,
  Complete = 2,
  Invoice = 3,
  Receipt = 4
}

// Helper functions
function getPeriodStatusLabel(status: PeriodStatus | null | undefined): string {
  switch (status) {
    case 2: return 'เสร็จสิ้น';
    case 3: return 'รอใบแจ้งหนี้';
    case 4: return 'รอใบเสร็จ';
    default: return '-';
  }
}

function getPeriodStatusClass(status: PeriodStatus | null | undefined): string {
  switch (status) {
    case 2: return 'badge-success';
    case 3: return 'badge-info';
    case 4: return 'badge-warning';
    default: return 'badge-secondary';
  }
}

function getPeriodStatusIcon(status: PeriodStatus | null | undefined): string {
  switch (status) {
    case 2: return 'checkmark-circle-outline';  // Complete
    case 3: return 'document-outline';          // Invoice
    case 4: return 'receipt-outline';           // Receipt
    default: return 'help-circle-outline';
  }
}
```

---

## Migration Checklist

### Required Changes

- [ ] **Update TypeScript interfaces** - Add `periodStatus?: PeriodStatus | null` to `PeriodDto`
- [ ] **Update status display logic** - Replace date-based status checks with `periodStatus` field
- [ ] **Update status badge components** - Use new `periodStatus` field instead of date checks
- [ ] **Update period filter dropdowns** - Ensure filter codes (1/2/3/4) are correctly mapped
- [ ] **Test period listing** - Verify periods display correct status badges
- [ ] **Test period filtering** - Verify filtering by status works correctly

### Optional Enhancements

- [ ] **Add manual override UI** - Allow users to manually change status for edge cases
- [ ] **Add amount comparison display** - Show progress bars (e.g., "8,000 / 10,000 บาท")
- [ ] **Add status change notifications** - Toast messages when status automatically changes
- [ ] **Add status history logging** - Track when status transitions occur
- [ ] **Add validation warnings** - Warn when amounts don't match before manual override

---

## Testing Guide

### Test Scenario 1: Gradual Invoice Addition

1. Create period with `total_income = 10,000`, income type = Invoice (3)
2. Add invoice for 3,000 → Verify status = 3 (Invoice)
3. Add invoice for 3,000 → Verify status = 3 (Invoice)
4. Add invoice for 4,000 → Verify status = 4 (Receipt)
5. Add receipt for 10,000 → Verify status = 2 (Complete)

### Test Scenario 2: Manual Override

1. Create period with `total_income = 10,000`, income type = Invoice (3)
2. Add invoice for 9,999.99 → Verify status = 3 (Invoice)
3. Call `PATCH /period/{id}/status` with Status=4 → Verify status = 4 (Receipt)
4. Add receipt for 9,999.99 → Verify status = 4 (Receipt)
5. Call `PATCH /period/{id}/status` with Status=2 → Verify status = 2 (Complete)

### Test Scenario 3: Filter by Status

1. Create multiple periods with different statuses
2. Call `GET /period/DN?filter=3` → Verify only Invoice status periods returned
3. Call `GET /period/DN?filter=4` → Verify only Receipt status periods returned
4. Call `GET /period/DN?filter=2` → Verify only Complete status periods returned

---

## Backwards Compatibility

### Bill/Product Periods (Income Type 1 & 2)

Periods with income type 1 (Bill) or 2 (Product) are **not affected** by this change:
- `periodStatus` will be `null` for these periods
- They follow a different workflow (order number binding)
- No status tracking is applied

**Example:**
```typescript
function shouldShowStatus(period: PeriodDto): boolean {
  // Only show status for Invoice (3) and CreditNote (4) types
  const incomeType = getIncomeType(period); // Get from related data
  return incomeType === 3 || incomeType === 4;
}
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** `periodStatus` is always `null`
- **Cause:** Database migration not run yet
- **Solution:** Run `migration/2026-01-09-add-period-status.sql` on the database

**Issue:** Status doesn't update after adding invoice
- **Cause:** Cache issue or frontend not refetching
- **Solution:** Force refetch period data after INSERT operations

**Issue:** Filter returns empty results
- **Cause:** All existing periods have `periodStatus = null` before migration
- **Solution:** Run migration to populate existing periods

### Migration Script

The backend includes a migration script that:
1. Adds `period_status` column to database
2. Initializes status for all existing Invoice/CreditNote periods based on current amounts
3. Sets Bill/Product periods to `NULL` status

After running migration, all existing periods will have correct status values.

---

## Contact

For questions or issues:
- **Backend API Issues:** Contact backend team
- **Frontend Implementation:** Update frontend codebase per this guide
- **Database Migration:** Ensure `migration/2026-01-09-add-period-status.sql` is executed

---

**Document Version:** 1.0
**Last Updated:** 2026-01-09
**Related Backend PR:** Period Status Management Enhancement
