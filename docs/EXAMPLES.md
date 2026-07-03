# API Usage Examples

> **STALE:** This describes the pre-rewrite module at
> `src/app/pages/other-income/` (`oi-baseform`/`monthly`/`period` services,
> v1 endpoints/concepts like "Light"/"Not-Light" contacts). The module was
> rewritten at `src/app/other-income/` — see `src/app/other-income/docs/`
> for current API and design context.

Common patterns and workflows for using the Other Income API.

---

## Table of Contents

1. [Complete Not-Light Contact Workflow](#1-complete-not-light-contact-workflow)
2. [Complete Light Contact Workflow](#2-complete-light-contact-workflow)
3. [Period Management Workflows](#3-period-management-workflows)
4. [Reporting Workflows](#4-reporting-workflows)
5. [Error Handling Patterns](#5-error-handling-patterns)

---

## 1. Complete Not-Light Contact Workflow

### Scenario: Create a new supplier agreement with monthly income tracking

```typescript
import { Injectable, inject } from '@angular/core';
import { OiBaseformService } from './service/other-income/oi-baseform.service';
import { MonthlyService } from './service/other-income/monthly.service';
import { PeriodService } from './service/other-income/period.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotLightWorkflowService {
  private baseform = inject(OiBaseformService);
  private monthly = inject(MonthlyService);
  private period = inject(PeriodService);

  async createCompleteNotLightContact() {
    try {
      // Step 1: Create Contact Head
      console.log('Creating contact head...');
      const headResult = await firstValueFrom(
        this.baseform.insert({
          compCode: 'ABC001',
          compType: 'DN',
          compName: 'บริษัท ABC จำกัด',
          eventId: 1,              // Event: โปรโมชั่น
          incomeId: 1,             // Income Type: ท้ายบิล
          period: 4,               // Period: Monthly
          startDate: '2026-01-01T00:00:00',
          endDate: '2026-12-31T23:59:59',
          displayName: 'ABC-ท้ายบิล-2026',
          productList: ['G001', 'G002']  // Selected products
        })
      );

      const headId = headResult.id;
      console.log(`✓ Contact head created: ${headId}`);

      // Step 2: Add Monthly Income (January)
      console.log('Adding January income...');
      await firstValueFrom(
        this.monthly.insertNotLight(headId, {
          eventType: 1,
          calAmount: 100000,       // Purchase amount
          actualAmount: 5000,      // Income amount (5%)
          startDate: '2026-01-01T00:00:00',
          endDate: '2026-01-31T23:59:59',
          reason: 'รายได้ประจำเดือน มกราคม',
          incomeAmount: 5000,
          cn: 0,                   // No credit note
          receList: [
            { calAmount: 5000, receNumb: 'REC-2026-001' }
          ]
        })
      );
      console.log('✓ January income added');

      // Step 3: Add Monthly Income (February)
      console.log('Adding February income...');
      await firstValueFrom(
        this.monthly.insertNotLight(headId, {
          eventType: 1,
          calAmount: 150000,
          actualAmount: 7500,
          startDate: '2026-02-01T00:00:00',
          endDate: '2026-02-28T23:59:59',
          reason: 'รายได้ประจำเดือน กุมภาพันธ์',
          incomeAmount: 7500,
          cn: 0,
          receList: [
            { calAmount: 7500, receNumb: 'REC-2026-002' }
          ]
        })
      );
      console.log('✓ February income added');

      // Step 4: Add Monthly Income (March)
      console.log('Adding March income...');
      await firstValueFrom(
        this.monthly.insertNotLight(headId, {
          eventType: 1,
          calAmount: 120000,
          actualAmount: 6000,
          startDate: '2026-03-01T00:00:00',
          endDate: '2026-03-31T23:59:59',
          reason: 'รายได้ประจำเดือน มีนาคม',
          incomeAmount: 6000,
          cn: 0,
          receList: [
            { calAmount: 6000, receNumb: 'REC-2026-003' }
          ]
        })
      );
      console.log('✓ March income added');

      // Step 5: Create Quarter 1 Period
      console.log('Creating Q1 period...');
      const periodResult = await firstValueFrom(
        this.period.createPeriod(headId, {
          periodName: 'Q1 2026',
          totalAmount: 370000,     // Total purchase: 100k + 150k + 120k
          totalIncome: 18500,      // Total income: 5k + 7.5k + 6k
          periodRemark: 'ไตรมาสที่ 1 ปี 2026',
          monthlyList: [
            { id: 1, startDate: '2026-01-01T00:00:00', endDate: '2026-01-31T23:59:59' },
            { id: 2, startDate: '2026-02-01T00:00:00', endDate: '2026-02-28T23:59:59' },
            { id: 3, startDate: '2026-03-01T00:00:00', endDate: '2026-03-31T23:59:59' }
          ]
        })
      );

      const periodId = periodResult.periodId;
      console.log(`✓ Period created: ${periodId}`);

      // Step 6: Add Purchase Orders to Period
      console.log('Adding purchase orders...');
      await firstValueFrom(
        this.period.insertPo(periodId, [
          {
            orderNumb: 'PO-2026-001',
            receNumb: 'REC-2026-001',
            actualAmount: 5000,
            remark: 'ใบสั่งซื้อเดือน ม.ค.'
          },
          {
            orderNumb: 'PO-2026-002',
            receNumb: 'REC-2026-002',
            actualAmount: 7500,
            remark: 'ใบสั่งซื้อเดือน ก.พ.'
          },
          {
            orderNumb: 'PO-2026-003',
            receNumb: 'REC-2026-003',
            actualAmount: 6000,
            remark: 'ใบสั่งซื้อเดือน มี.ค.'
          }
        ])
      );
      console.log('✓ Purchase orders added');

      console.log('🎉 Complete! Not-light contact created successfully');
      return { headId, periodId };

    } catch (error) {
      console.error('❌ Error creating not-light contact:', error);
      throw error;
    }
  }
}
```

---

## 2. Complete Light Contact Workflow

### Scenario: Create a light-box promotion with multiple branches

```typescript
import { Injectable, inject } from '@angular/core';
import { OiBaseformService } from './service/other-income/oi-baseform.service';
import { MonthlyService } from './service/other-income/monthly.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LightWorkflowService {
  private baseform = inject(OiBaseformService);
  private monthly = inject(MonthlyService);

  async createCompleteLightContact() {
    try {
      // Step 1: Create Contact Head
      console.log('Creating light contact head...');
      const headResult = await firstValueFrom(
        this.baseform.insert({
          compCode: 'XYZ002',
          compType: 'HU',
          compName: 'บริษัท XYZ จำกัด',
          eventId: 2,              // Event: Light Box
          incomeId: 3,             // Income Type: Invoice
          period: 4,               // Period: Monthly
          startDate: '2026-01-01T00:00:00',
          endDate: '2026-12-31T23:59:59',
          displayName: 'XYZ-LightBox-2026',
          productList: null        // No specific products
        })
      );

      const headId = headResult.id;
      console.log(`✓ Light contact head created: ${headId}`);

      // Step 2: Create January Light Income Period
      console.log('Creating January period...');
      await firstValueFrom(
        this.monthly.insertLight(headId, {
          createDate: '2026-01-01T00:00:00'
        })
      );
      console.log('✓ January period created');

      // Step 3: Add Branches for January
      console.log('Adding branches for January...');

      // Assume we have period ID from backend response (simplified here)
      const janPeriodId = 1; // In real app, get from monthly income list

      // Branch 1: Bangkok
      await firstValueFrom(
        this.monthly.addBranch(janPeriodId, {
          branchCode: '001',
          openDate: '2026-01-01T00:00:00',
          periodId: janPeriodId
        })
      );
      console.log('✓ Branch 001 (Bangkok) added');

      // Branch 2: Chiang Mai
      await firstValueFrom(
        this.monthly.addBranch(janPeriodId, {
          branchCode: '002',
          openDate: '2026-01-05T00:00:00',
          periodId: janPeriodId
        })
      );
      console.log('✓ Branch 002 (Chiang Mai) added');

      // Branch 3: Phuket
      await firstValueFrom(
        this.monthly.addBranch(janPeriodId, {
          branchCode: '003',
          openDate: '2026-01-10T00:00:00',
          periodId: janPeriodId
        })
      );
      console.log('✓ Branch 003 (Phuket) added');

      // Step 4: Create February Period
      console.log('Creating February period...');
      await firstValueFrom(
        this.monthly.insertLight(headId, {
          createDate: '2026-02-01T00:00:00'
        })
      );
      console.log('✓ February period created');

      console.log('🎉 Complete! Light contact with branches created successfully');
      return { headId };

    } catch (error) {
      console.error('❌ Error creating light contact:', error);
      throw error;
    }
  }
}
```

---

## 3. Period Management Workflows

### 3.1 Invoice/Receipt Workflow

For income type 3 (Invoice), you need to add both invoice and receipt:

```typescript
async addInvoiceAndReceipt(periodId: number) {
  // Step 1: Add Invoice
  await firstValueFrom(
    this.periodService.insertInv(periodId, {
      invNumb: 'INV-2026-001',
      invDate: '2026-01-15T00:00:00',
      invAmount: 10000,
      invRemark: 'ใบแจ้งหนี้ Q1'
    })
  );
  console.log('✓ Invoice added');

  // Step 2: Add Receipt (after invoice)
  await firstValueFrom(
    this.periodService.insertRece(periodId, {
      receNumb: 'REC-2026-001',
      receDate: '2026-01-20T00:00:00',
      receAmount: 10000,
      receRemark: 'รับชำระเต็มจำนวน'
    })
  );
  console.log('✓ Receipt added');
}
```

### 3.2 Credit Note Workflow

For income type 4 (Credit Note):

```typescript
async addCreditNote(periodId: number) {
  await firstValueFrom(
    this.periodService.insertCredit(periodId, {
      creditNumb: 'CN-2026-001',
      creditDate: '2026-01-25T00:00:00',
      creditAmount: 5000,
      creditRemark: 'คืนสินค้าเสียหาย'
    })
  );
  console.log('✓ Credit note added');
}
```

### 3.3 Edit Period Metadata

Update period name and remark:

```typescript
async updatePeriodMetadata(periodId: number) {
  const result = await firstValueFrom(
    this.api.put(`${environment.oi}/period/${periodId}`, {
      periodName: 'Q1 2026 (แก้ไข)',
      periodRemark: 'ปรับปรุงข้อมูลเดือน มีนาคม'
    })
  );

  if (result.affectedRows > 0) {
    console.log('✓ Period metadata updated');
  } else {
    console.warn('⚠️ No rows affected');
  }
}
```

---

## 4. Reporting Workflows

### 4.1 Monthly Supplier Report

Get detailed monthly report for a specific supplier:

```typescript
async getSupplierMonthlyReport(compCode: string, month: string) {
  // Get summary report
  const summary = await firstValueFrom(
    this.supplierReportService.getSupplierMonthly('DN', compCode, month)
  );
  console.log('Summary:', summary);

  // Get detailed report
  const detail = await firstValueFrom(
    this.supplierReportService.getSupplierMonthlyDetail('DN', compCode, month)
  );
  console.log('Detail:', detail);

  return { summary, detail };
}

// Example usage:
getSupplierMonthlyReport('ABC001', '2026-01');
```

### 4.2 Annual Supplier Report

Get full year report for supplier:

```typescript
async getSupplierAnnualReport(compCode: string, year: string) {
  const annual = await firstValueFrom(
    this.supplierReportService.getSupplierAnnual('DN', compCode, year)
  );

  // Process monthly breakdown
  annual.forEach(report => {
    console.log(`Company: ${report.head.compName}`);
    report.monthly.forEach(month => {
      console.log(`  ${month.key}: ${month.value}`);
    });
  });

  return annual;
}

// Example usage:
getSupplierAnnualReport('ABC001', '2026');
```

### 4.3 Account Reports by Date Range

Get various account reports for a specific date range:

```typescript
async getAccountReportsByRange(startDate: string, endDate: string) {
  const [bills, products, invRece, credits] = await Promise.all([
    // Bill report
    firstValueFrom(
      this.accountReportService.getBillRangeReport('DN', startDate, endDate)
    ),

    // Product report
    firstValueFrom(
      this.accountReportService.getProductRangeReport('DN', startDate, endDate)
    ),

    // Invoice-Receipt report
    firstValueFrom(
      this.accountReportService.getInvReceRangeReport('DN', startDate, endDate)
    ),

    // Credit report
    firstValueFrom(
      this.accountReportService.getCreditRangeReport('DN', startDate, endDate)
    )
  ]);

  return { bills, products, invRece, credits };
}

// Example usage:
getAccountReportsByRange('2026-01-01', '2026-01-31');
```

---

## 5. Error Handling Patterns

### 5.1 Comprehensive Error Handling

```typescript
import { catchError, retry, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

async safeApiCall() {
  return firstValueFrom(
    this.periodService.createPeriod(123, periodData).pipe(
      // Timeout after 30 seconds
      timeout(30000),

      // Retry up to 2 times on failure
      retry(2),

      // Catch and handle errors
      catchError(error => {
        console.error('API Error:', error);

        // Handle specific error types
        if (error.status === 404) {
          this.toastService.danger('ไม่พบข้อมูล Contact');
        } else if (error.status === 400) {
          this.toastService.danger('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        } else if (error.status === 500) {
          this.toastService.danger('เกิดข้อผิดพลาดในระบบ');
        } else {
          this.toastService.danger('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }

        return throwError(() => error);
      })
    )
  );
}
```

### 5.2 Loading State Pattern

```typescript
@Component({...})
export class MyComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  async loadData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(
        this.oiNotLightService.getById(123, 'DN')
      );

      // Process result
      console.log('Data loaded:', result);

    } catch (error: any) {
      const message = error?.error?.message || 'เกิดข้อผิดพลาด';
      this.error.set(message);
      this.toastService.danger(message);

    } finally {
      this.loading.set(false);
    }
  }
}
```

### 5.3 Validation Before API Call

```typescript
validatePeriodData(data: TCreatPeriodReq): string[] {
  const errors: string[] = [];

  if (!data.periodName || data.periodName.trim() === '') {
    errors.push('กรุณาระบุชื่อ Period');
  }

  if (data.totalAmount <= 0) {
    errors.push('ยอดซื้อต้องมากกว่า 0');
  }

  if (data.totalIncome <= 0) {
    errors.push('รายได้ต้องมากกว่า 0');
  }

  if (!data.monthlyList || data.monthlyList.length === 0) {
    errors.push('กรุณาเลือกรายได้รายเดือน');
  }

  return errors;
}

async createPeriodWithValidation(headId: number, data: TCreatPeriodReq) {
  // Validate first
  const errors = this.validatePeriodData(data);

  if (errors.length > 0) {
    errors.forEach(err => this.toastService.danger(err));
    return null;
  }

  // Proceed with API call
  try {
    const result = await firstValueFrom(
      this.periodService.createPeriod(headId, data)
    );
    this.toastService.success('สร้าง Period สำเร็จ');
    return result;

  } catch (error) {
    this.toastService.danger('เกิดข้อผิดพลาดในการสร้าง Period');
    throw error;
  }
}
```

---

## 6. Reactive Patterns with Signals

### 6.1 Using Signals for Real-time Updates

```typescript
@Component({...})
export class NotLightDetailComponent {
  private notLightService = inject(OiNotLightService);

  // Signal-based data
  data = this.notLightService.singleRecord;  // From service signal

  // Computed values
  periods = computed(() => this.data()[0]?.periodList || []);
  incomes = computed(() => this.data()[0]?.incomeList || []);

  // Event handlers
  onSuccess(message: string) {
    this.toastService.success(message);
    // Automatically refetch - signal will update reactively
    this.notLightService.refetch();
  }

  onFail(message: string) {
    this.toastService.danger(message);
  }
}
```

### 6.2 Combining Multiple API Calls

```typescript
async loadAllData(headId: number, compType: TCompType) {
  const [detail, events, incomes, discounts] = await Promise.all([
    firstValueFrom(this.oiNotLightService.getById(headId, compType)),
    firstValueFrom(this.eventService.getAll()),
    firstValueFrom(this.incomeService.getAll()),
    firstValueFrom(this.discountService.getAll())
  ]);

  return {
    detail: detail[0],
    events,
    incomes,
    discounts
  };
}
```

---

**Last Updated:** 2026-01-08
**See Also:** [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint documentation
