# Other Income API Reference

> **STALE:** This describes the pre-rewrite module at
> `src/app/pages/other-income/` (`oi-light`/`oi-not-light` services, v1
> endpoints). The module was rewritten at `src/app/other-income/` — see
> `src/app/other-income/docs/api/*.md` for current API reference and
> `src/app/other-income/docs/context/decisions.md` for what changed and why.

**Base URL:** `https://api.otherincome.healthupgroup.com`
**Environment Variable:** `environment.oi`
**Last Updated:** 2026-01-08

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [Master Data APIs](#1-master-data-apis)
4. [Contact Management APIs](#2-contact-management-apis)
5. [Period Management APIs](#3-period-management-apis)
6. [Purchase Order APIs](#4-purchase-order-apis)
7. [Monthly Income APIs](#5-monthly-income-apis)
8. [Report APIs](#6-report-apis)
9. [Type Definitions](#appendix-a-type-definitions)

---

## Overview

### Base Configuration
- **Base URL:** `https://api.otherincome.healthupgroup.com`
- **Environment Variable:** `environment.oi` (configured in `src/environments/environment.ts`)
- **Authentication:** Not documented
- **Content-Type:** `application/json`

### Company Type Parameter
Many endpoints require a `{compType}` path parameter:
- `DN` - DrugNet
- `HU` - HealthUp

### Common Patterns
- Date format: ISO 8601 (`YYYY-MM-DDTHH:mm:ss`)
- Query parameters for filtering: `compCode`, `month`, `year`, `startDate`, `endDate`
- Path parameters for IDs: `{id}`, `{periodId}`, `{compCode}`

---

## Quick Reference

| Category | Method | Endpoint | Service File |
|----------|--------|----------|--------------|
| **Master Data** |
| Branch Search | GET | `/other-income/branch` | branch.service.ts |
| Company Search | GET | `/other-income/comp/{group}` | company.service.ts |
| Discount List | GET | `/other-income/discount` | discount.service.ts |
| Event List | GET | `/other-income/event` | event.service.ts |
| Income Types | GET | `/other-income/income` | income.service.ts |
| Product Search | GET | `/other-income/product/{compType}` | oi-product.service.ts |
| **Contact Management** |
| Create Contact Head | POST | `/other-income/contact/head` | oi-baseform.service.ts |
| Get Light Contacts | GET | `/other-income/contact/light/{compType}` | oi-light.service.ts |
| Get Light Contact Detail | GET | `/other-income/contact/light/{compType}/{id}` | oi-light.service.ts |
| Create Light Contact | POST | `/other-income/contact/light` | oi-light.service.ts |
| Update Light Contact | POST | `/other-income/contact/light/{id}` | oi-light.service.ts |
| Add Branch to Light | POST | `/other-income/contact/light/{id}/branch` | oi-light.service.ts |
| Get Not-Light Contacts | GET | `/other-income/contact/not-light/{compType}` | oi-not-light.service.ts |
| Get Not-Light Detail | GET | `/other-income/contact/not-light/{compType}/{id}` | oi-not-light.service.ts |
| Create Not-Light Contact | POST | `/other-income/contact/not-light` | oi-not-light.service.ts |
| Update Not-Light Contact | POST | `/other-income/contact/not-light/{id}` | oi-not-light.service.ts |
| Add Income to Not-Light | POST | `/other-income/contact/not-light/{id}/incomes` | oi-not-light.service.ts |
| Get Terms | GET | `/other-income/contact/not-light/{id}/terms` | oi-not-light.service.ts |
| **Period Management** |
| Get Periods (Light) | GET | `/period/{compType}` | period-light.service.ts |
| Get Periods (Not-Light) | GET | `/period/{compType}` | period-not-light.service.ts |
| Create Period | POST | `/period/create/{id}` | period.service.ts |
| Add Orders to Period | POST | `/period/{periodId}/order` | period.service.ts |
| Add Invoice to Period | POST | `/period/{periodId}/invoice` | period.service.ts |
| Add Receipt to Period | POST | `/period/{periodId}/receipt` | period.service.ts |
| Add Credit to Period | POST | `/period/{periodId}/credit` | period.service.ts |
| Update Period Metadata | PUT | `/period/{periodId}` | edit-period-modal.component.ts |
| **Purchase Orders** |
| Get PO Bills | GET | `/po/bill/{compType}/{compCode}/{discType}` | order.service.ts |
| Get PO Goods | GET | `/po/good/{compType}/{compCode}/{discType}` | order.service.ts |
| **Monthly Income** |
| Get Income List | GET | `/monthly-income/income-list/{id}` | monthly.service.ts |
| Add Not-Light Income | POST | `/monthly-income/{headId}/add-income` | monthly.service.ts |
| Add Light Income | POST | `/monthly-income/{headId}/add-light-income` | monthly.service.ts |
| Add Branch to Income | POST | `/monthly-income/{lightId}/add-branch` | monthly.service.ts |
| Delete Branch | DELETE | `/monthly-income/branch/{branchId}` | monthly.service.ts |
| Delete Income Item | DELETE | `/monthly-income/income-item/{monthId}` | monthly.service.ts |
| **Reports** |
| Account Invoices | GET | `/report/account/{compType}/invoices` | oi-account-report.service.ts |
| Account Receipts | GET | `/report/account/{compType}/receipts` | oi-account-report.service.ts |
| Annual Report | GET | `/report/account/{compType}` | oi-account-report.service.ts |
| Light-Box Annual | GET | `/report/account/{compType}/annual/light-box` | oi-account-report.service.ts |
| Annual Income | GET | `/report/account/{compType}/annual` | oi-account-report.service.ts |
| Monthly Buy List | GET | `/report/account/{compType}/month/buy-list` | oi-account-report.service.ts |
| Monthly Income | GET | `/report/account/{compType}/month/ince` | oi-account-report.service.ts |
| Bill Report by Range | GET | `/report/account/{compType}/range/bill` | oi-account-report.service.ts |
| Product Report by Range | GET | `/report/account/{compType}/range/product` | oi-account-report.service.ts |
| Invoice-Receipt Range | GET | `/report/account/{compType}/range/inv-rece` | oi-account-report.service.ts |
| Credit Report by Range | GET | `/report/account/{compType}/range/credit` | oi-account-report.service.ts |
| Monthly Supplier Report | GET | `/report/supplier/{compType}/{compCode}` | supplier-report.service.ts |
| Monthly Supplier Detail | GET | `/report/supplier/monthly/{compType}/{compCode}/detail` | supplier-report.service.ts |
| Annual Supplier Report | GET | `/report/supplier/annual/{compType}/{compCode}` | supplier-report.service.ts |

---

## 1. Master Data APIs

### 1.1 Search Branches

**Endpoint:** `GET /other-income/branch`
**Service:** `branch.service.ts::searchBranches()`

**Query Parameters:**
```typescript
{
  term: string  // Search term for branch code or name
}
```

**Response:**
```typescript
TBranchDto[] {
  branchCode: string
  branchName: string
}[]
```

**Example:**
```typescript
this.branchService.searchBranches('001').subscribe(branches => {
  console.log(branches); // [{ branchCode: '001', branchName: 'สาขากรุงเทพ' }]
});
```

**Notes:**
- Returns branches matching the search term
- Used in branch selection dropdowns

---

### 1.2 Search Companies

**Endpoint:** `GET /other-income/comp/{group}`
**Service:** `company.service.ts::search()`

**Path Parameters:**
- `{group}` - Company group: `DN` or `HU`

**Query Parameters (Either/Or):**
```typescript
{
  name?: string  // Search by company name
  code?: string  // Search by company code
}
```

**Response:**
```typescript
TOIComp[] {
  compCode: string
  compName: string
  compType: string
  compName2: string
  compGroupCode: string
}[]
```

**Example:**
```typescript
// Search by code
this.companyService.search('DN', { code: 'ABC001' }).subscribe(companies => {
  console.log(companies);
});

// Search by name
this.companyService.search('HU', { name: 'บริษัท' }).subscribe(companies => {
  console.log(companies);
});
```

**Notes:**
- Provide either `name` OR `code`, not both
- Used in company autocomplete fields

---

### 1.3 Get Discount List

**Endpoint:** `GET /other-income/discount`
**Service:** `discount.service.ts::getAll()`

**Response:**
```typescript
TDiscount[] {
  id: number
  discountName: string
}[]
```

**Example:**
```typescript
this.discountService.getAll().subscribe(discounts => {
  console.log(discounts);
  // [
  //   { id: 2, discountName: 'ส่วนลด A' },
  //   { id: 3, discountName: 'ส่วนลด B' }
  // ]
});
```

**Notes:**
- Returns all discounts except id=1
- Used in discount selection

---

### 1.4 Get Event List

**Endpoint:** `GET /other-income/event`
**Service:** `event.service.ts::getAll()`

**Response:**
```typescript
TEvent[] {
  id: number
  eventName: string
  eventType: number
}[]
```

**Example:**
```typescript
this.eventService.getAll().subscribe(events => {
  console.log(events);
  // [
  //   { id: 1, eventName: 'โปรโมชั่นพิเศษ', eventType: 1 },
  //   { id: 2, eventName: 'ส่วนลดประจำเดือน', eventType: 2 }
  // ]
});
```

**Notes:**
- Returns all available events
- Used in event selection dropdowns

---

### 1.5 Get Income Types

**Endpoint:** `GET /other-income/income`
**Service:** `income.service.ts::getAll()`

**Response:**
```typescript
TIncome[] {
  id: number
  incomeName: string
  incomeType: number
}[]
```

**Example:**
```typescript
this.incomeService.getAll().subscribe(incomes => {
  console.log(incomes);
  // [
  //   { id: 1, incomeName: 'ท้ายบิล', incomeType: 1 },
  //   { id: 2, incomeName: 'สินค้า', incomeType: 2 },
  //   { id: 3, incomeName: 'Invoice', incomeType: 3 },
  //   { id: 4, incomeName: 'Credit Note', incomeType: 4 }
  // ]
});
```

**Notes:**
- Income types determine which components render in period display
- `incomeType` values: 1=Order, 2=Good Order, 3=Invoice/Receipt, 4=Credit

---

### 1.6 Search Products

**Endpoint:** `GET /other-income/product/{compType}`
**Service:** `oi-product.service.ts::searchProduct()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  compCode: string  // Company code to search products for
}
```

**Response:**
```typescript
TSearchProductResult[] {
  goodCode: string
  goodName: string
  barCode: string
}[]
```

**Example:**
```typescript
this.productService.searchProduct('DN', 'ABC001').subscribe(products => {
  console.log(products);
  // [
  //   { goodCode: 'G001', goodName: 'สินค้า A', barCode: '8851234567890' }
  // ]
});
```

**Notes:**
- Returns products for specified company
- Used in product selection

---

## 2. Contact Management APIs

### 2.1 Create Contact Head

**Endpoint:** `POST /other-income/contact/head`
**Service:** `oi-baseform.service.ts::insert()`

**Request:**
```typescript
TApiBaseformInsert {
  compCode: string
  compType: 'DN' | 'HU'
  compName: string
  eventId: number
  incomeId: number
  period: number
  startDate: string  // ISO format: "2026-01-01T00:00:00"
  endDate: string
  displayName: string
  productList: string[] | null
}
```

**Response:**
```typescript
{
  id: number  // Created contact head ID
}
```

**Example:**
```typescript
this.baseformService.insert({
  compCode: 'ABC001',
  compType: 'DN',
  compName: 'บริษัท ABC จำกัด',
  eventId: 1,
  incomeId: 1,
  period: 4,  // 1=annual, 2=half, 3=quarter, 4=month
  startDate: '2026-01-01T00:00:00',
  endDate: '2026-12-31T23:59:59',
  displayName: 'ABC-2026',
  productList: ['G001', 'G002']
}).subscribe(result => {
  console.log('Created contact ID:', result.id);
});
```

**Notes:**
- Creates the base contact header
- Required before creating light or not-light contacts
- `period`: 1=annual, 2=half-year, 3=quarter, 4=month

---

### 2.2 Get Light Contacts

**Endpoint:** `GET /other-income/contact/light/{compType}`
**Service:** `oi-light.service.ts::getAll()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters (Optional):**
```typescript
{
  compCode?: string
  compName?: string
  goodCode?: string
}
```

**Response:**
```typescript
ManyContactLightResponse[] {
  id: number
  displayName: string
  startDate: string
  endDate: string
  compCode: string
  compName: string
  eventName: string
  eventType: number
  compType: string
  incomeName: string
  incomeType: number
  totalBranch: number
  totalAmount: number
}[]
```

**Example:**
```typescript
this.oiLightService.getAll('DN', { compCode: 'ABC001' }).subscribe(contacts => {
  console.log(contacts);
});
```

---

### 2.3 Get Light Contact Detail

**Endpoint:** `GET /other-income/contact/light/{compType}/{id}`
**Service:** `oi-light.service.ts::getById()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{id}` - Contact ID

**Response:**
```typescript
TDetailLight[] // Complex nested structure with periods and branches
```

**Example:**
```typescript
this.oiLightService.getById(123, 'DN').subscribe(detail => {
  console.log(detail);
});
```

**Notes:**
- Returns complete light contact with all periods and branches
- Used in detail view pages

---

### 2.4 Get Not-Light Contacts

**Endpoint:** `GET /other-income/contact/not-light/{compType}`
**Service:** `oi-not-light.service.ts::getAll()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters (Optional):**
```typescript
{
  compCode?: string
  compName?: string
  goodCode?: string
}
```

**Response:**
```typescript
ManyContactResponse[] {
  id: number
  displayName: string
  startDate: string
  endDate: string
  compCode: string
  compName: string
  eventName: string
  eventType: number
  compType: string
  incomeName: string
  incomeType: number
}[]
```

**Example:**
```typescript
this.notLightService.getAll('DN', { compName: 'ABC' }).subscribe(contacts => {
  console.log(contacts);
});
```

---

### 2.5 Get Not-Light Contact Detail

**Endpoint:** `GET /other-income/contact/not-light/{compType}/{id}`
**Service:** `oi-not-light.service.ts::getById()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{id}` - Contact ID

**Response:**
```typescript
NotLightSingle[] // Complete contact with periods, income, orders
```

**Example:**
```typescript
this.notLightService.getById(123, 'DN').subscribe(detail => {
  console.log(detail);
  // Access periods: detail[0].periodList
  // Access monthly income: detail[0].incomeList
});
```

**Notes:**
- Returns complete not-light contact structure
- Includes populated periods with orders/invoices/receipts/credits
- Used in [not-light-single.component.ts](../src/app/pages/other-income/purchase/not-light-single/not-light-single.component.ts)

---

### 2.6 Add Income to Not-Light Contact

**Endpoint:** `POST /other-income/contact/not-light/{id}/incomes`
**Service:** `oi-not-light.service.ts::addIncome()`

**Path Parameters:**
- `{id}` - Contact head ID

**Request:**
```typescript
TInsertMonthlyIncome {
  // Income details
}
```

**Notes:**
- Adds monthly income records to not-light contact
- Used after creating the contact head

---

## 3. Period Management APIs

### 3.1 Get Periods (Light Contacts)

**Endpoint:** `GET /period/{compType}`
**Service:** `period-light.service.ts::get()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  filter: number
  eventId?: number
  compCode?: string
  goodCode?: string
  isLight: 2      // Filter for light contacts
  incomeType: 3   // Invoice type
}
```

**Response:**
```typescript
TPeriodSummaryLight[] {
  id: number
  displayName: string
  periodId: number
  periodName: string
  remark: string
  event: TEvent
  company: TOIComp
  startDate: string
  endDate: string
  invDate: string | null
  receDate: string | null
}[]
```

---

### 3.2 Get Periods (Not-Light Contacts)

**Endpoint:** `GET /period/{compType}`
**Service:** `period-not-light.service.ts::get()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  filter: number
  eventId?: number
  compCode?: string
  goodCode?: string
  incomeType: 3
  isLight: 1      // Filter for not-light contacts
}
```

**Response:**
```typescript
TPeriodSummary[] {
  id: number
  displayName: string
  cn: string
  periodId: number
  remark: string
  event: TEvent
  income: TIncome
  company: TOIComp
  startDate: string
  endDate: string
  invDate: string | null
  receDate: string | null
  periodName: string
}[]
```

---

### 3.3 Create Period

**Endpoint:** `POST /period/create/{id}`
**Service:** `period.service.ts::createPeriod()`

**Path Parameters:**
- `{id}` - Contact head ID

**Request:**
```typescript
TCreatPeriodReq {
  periodName: string
  totalAmount: number
  totalIncome: number
  periodRemark: string
  monthlyList: TMonth[]  // Array of monthly income items
}

TMonth {
  id: number
  startDate: string
  endDate: string
}
```

**Response:**
```typescript
{
  periodId: number  // Created period ID
}
```

**Example:**
```typescript
this.periodService.createPeriod(123, {
  periodName: 'Q1 2026',
  totalAmount: 100000,
  totalIncome: 5000,
  periodRemark: 'First quarter',
  monthlyList: [
    { id: 1, startDate: '2026-01-01T00:00:00', endDate: '2026-01-31T23:59:59' },
    { id: 2, startDate: '2026-02-01T00:00:00', endDate: '2026-02-28T23:59:59' },
    { id: 3, startDate: '2026-03-01T00:00:00', endDate: '2026-03-31T23:59:59' }
  ]
}).subscribe(result => {
  console.log('Created period:', result.periodId);
});
```

**Notes:**
- Groups multiple monthly incomes into a single period
- `monthlyList` must contain valid monthly income IDs
- Used in [create-period.component.ts](../src/app/components/other-income/create/create-period/create-period.component.ts)

---

### 3.4 Add Orders to Period

**Endpoint:** `POST /period/{periodId}/order`
**Service:** `period.service.ts::insertPo()`

**Path Parameters:**
- `{periodId}` - Period ID

**Request:**
```typescript
{
  poList: TOrderList[]
}

TOrderList {
  orderNumb: string     // PO number
  receNumb: string      // Receipt number
  actualAmount: number  // Income amount
  remark: string
}
```

**Example:**
```typescript
this.periodService.insertPo(456, [
  {
    orderNumb: 'PO-2026-001',
    receNumb: 'REC-2026-001',
    actualAmount: 1500,
    remark: 'January income'
  }
]).subscribe(() => {
  console.log('Orders added to period');
});
```

**Notes:**
- Associates purchase orders with a period
- Used for income type 1 (Order) and 2 (Good Order)

---

### 3.5 Add Invoice to Period

**Endpoint:** `POST /period/{periodId}/invoice`
**Service:** `period.service.ts::insertInv()`

**Path Parameters:**
- `{periodId}` - Period ID

**Request:**
```typescript
TPeriodInvReq {
  invNumb: string
  invDate: string      // ISO format
  invAmount: number
  invRemark: string
}
```

**Example:**
```typescript
this.periodService.insertInv(456, {
  invNumb: 'INV-2026-001',
  invDate: '2026-01-15T00:00:00',
  invAmount: 10000,
  invRemark: 'January invoice'
}).subscribe(() => {
  console.log('Invoice added');
});
```

**Notes:**
- Used for income type 3 (Invoice)
- Invoice must be created before receipt

---

### 3.6 Add Receipt to Period

**Endpoint:** `POST /period/{periodId}/receipt`
**Service:** `period.service.ts::insertRece()`

**Path Parameters:**
- `{periodId}` - Period ID

**Request:**
```typescript
TPeriodReceReq {
  receNumb: string
  receDate: string      // ISO format
  receAmount: number
  receRemark: string
}
```

**Example:**
```typescript
this.periodService.insertRece(456, {
  receNumb: 'REC-2026-001',
  receDate: '2026-01-20T00:00:00',
  receAmount: 10000,
  receRemark: 'Payment received'
}).subscribe(() => {
  console.log('Receipt added');
});
```

**Notes:**
- Used for income type 3 (Invoice/Receipt workflow)
- Receipt confirms payment of invoice

---

### 3.7 Add Credit Note to Period

**Endpoint:** `POST /period/{periodId}/credit`
**Service:** `period.service.ts::insertCredit()`

**Path Parameters:**
- `{periodId}` - Period ID

**Request:**
```typescript
TPeriodCreditReq {
  creditNumb: string
  creditDate: string     // ISO format
  creditAmount: number
  creditRemark: string
}
```

**Example:**
```typescript
this.periodService.insertCredit(456, {
  creditNumb: 'CN-2026-001',
  creditDate: '2026-01-25T00:00:00',
  creditAmount: 5000,
  creditRemark: 'Product return credit'
}).subscribe(() => {
  console.log('Credit note added');
});
```

**Notes:**
- Used for income type 4 (Credit Note)
- Handles product returns and credits

---

### 3.8 Update Period Metadata

**Endpoint:** `PUT /period/{periodId}`
**Service:** `edit-period-modal.component.ts::onSave()`

**Path Parameters:**
- `{periodId}` - Period ID

**Request:**
```typescript
{
  periodName: string     // Updated period name
  periodRemark: string   // Updated period remark
}
```

**Response:**
```typescript
{
  affectedRows: number  // Number of rows updated (should be 1)
}
```

**Example:**
```typescript
this.api.put(`${this.url}/period/456`, {
  periodName: 'Q1 2026 (Updated)',
  periodRemark: 'Updated remark'
}).subscribe(result => {
  if (result.affectedRows > 0) {
    console.log('Period updated successfully');
  }
});
```

**Notes:**
- Only updates period name and remark (metadata)
- Used in [edit-period-modal.component.ts](../src/app/components/other-income/period/edit-period-modal/edit-period-modal.component.ts)
- Integrated into [other-income-period-display.component.ts](../src/app/components/other-income/period/other-income-period-display/other-income-period-display.component.ts)

---

## 4. Purchase Order APIs

### 4.1 Get Purchase Order Bills

**Endpoint:** `GET /po/bill/{compType}/{compCode}/{discType}`
**Service:** `order.service.ts::fetchBill()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{compCode}` - Company code
- `{discType}` - Discount type ID

**Query Parameters:**
```typescript
TOnSearchParams {
  order: string       // Order number filter
  receStart?: string  // Receipt date range start
  receEnd?: string
  billStart?: string  // Bill date range start
  billEnd?: string
}
```

**Response:**
```typescript
TOiBill[] {
  remark: string
  orderNumb: string
  discount: number
  receList: { receNumb: string, discount: number }[]
  receDate: string
  billDate: string
  billNumb: string
}[]
```

**Example:**
```typescript
this.orderService.fetchBill('DN', 'ABC001', 2, {
  order: 'PO-2026',
  receStart: '2026-01-01',
  receEnd: '2026-01-31'
}).subscribe(bills => {
  console.log('Purchase order bills:', bills);
});
```

**Notes:**
- Returns bills grouped by PO number
- Used for income type 1 (Order/Bill)

---

### 4.2 Get Purchase Order Goods

**Endpoint:** `GET /po/good/{compType}/{compCode}/{discType}`
**Service:** `order.service.ts::fetchGood()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{compCode}` - Company code
- `{discType}` - Discount type ID

**Query Parameters:**
```typescript
TOnSearchParams {
  order: string       // Order number filter
  receStart?: string
  receEnd?: string
  billStart?: string
  billEnd?: string
}
```

**Response:**
```typescript
TOiGood[] {
  remark: string
  orderNumb: string
  discount: number
  productList: {
    goodCode: string
    goodName: string
    barCode: string
    receNumb: string
    discount: number
  }[]
  receDate: string
  billDate: string
  billNumb: string
}[]
```

**Example:**
```typescript
this.orderService.fetchGood('DN', 'ABC001', 2, {
  order: 'PO-2026',
  billStart: '2026-01-01',
  billEnd: '2026-01-31'
}).subscribe(goods => {
  console.log('Products in POs:', goods);
});
```

**Notes:**
- Returns PO details with product breakdown
- Used for income type 2 (Good Order/Product)

---

## 5. Monthly Income APIs

### 5.1 Get Monthly Income List

**Endpoint:** `GET /monthly-income/income-list/{id}`
**Service:** `monthly.service.ts::getMonthlyIncome()`

**Path Parameters:**
- `{id}` - Contact head ID

**Query Parameters:**
```typescript
{
  month: string        // Format: "YYYY-MM"
  comp: TCompType      // Company type: "DN" | "HU"
}
```

**Response:**
```typescript
TMonthlyIncomeItem2[] // Array of monthly income items
```

**Example:**
```typescript
this.monthlyService.getMonthlyIncome(123, '2026-01', 'DN').subscribe(incomes => {
  console.log('Monthly incomes:', incomes);
});
```

---

### 5.2 Add Not-Light Monthly Income

**Endpoint:** `POST /monthly-income/{headId}/add-income`
**Service:** `monthly.service.ts::insertNotLight()`

**Path Parameters:**
- `{headId}` - Contact head ID

**Request:**
```typescript
TInsertReq {
  eventType: number
  calAmount: number
  actualAmount: number
  startDate: string      // ISO format
  reason: string
  incomeAmount: number
  cn: number
  receList: { calAmount: number, receNumb: string }[]
  endDate?: string
}
```

**Example:**
```typescript
this.monthlyService.insertNotLight(123, {
  eventType: 1,
  calAmount: 100000,
  actualAmount: 5000,
  startDate: '2026-01-01T00:00:00',
  endDate: '2026-01-31T23:59:59',
  reason: 'Monthly income',
  incomeAmount: 5000,
  cn: 0,
  receList: [
    { calAmount: 5000, receNumb: 'REC-001' }
  ]
}).subscribe(() => {
  console.log('Income added');
});
```

**Notes:**
- Adds monthly income record for not-light contacts
- Must specify receipt list

---

### 5.3 Add Light Monthly Income

**Endpoint:** `POST /monthly-income/{headId}/add-light-income`
**Service:** `monthly.service.ts::insertLight()`

**Path Parameters:**
- `{headId}` - Contact head ID

**Request:**
```typescript
{
  createDate: string  // ISO format: "2026-01-01T00:00:00"
}
```

**Example:**
```typescript
this.monthlyService.insertLight(123, {
  createDate: '2026-01-01T00:00:00'
}).subscribe(() => {
  console.log('Light income period created');
});
```

**Notes:**
- Creates a monthly income period for light contacts
- Branches are added separately

---

### 5.4 Add Branch to Monthly Income

**Endpoint:** `POST /monthly-income/{lightId}/add-branch`
**Service:** `monthly.service.ts::addBranch()`

**Path Parameters:**
- `{lightId}` - Light monthly income ID

**Request:**
```typescript
{
  branchCode: string
  openDate: string     // ISO format
  periodId: number
}
```

**Example:**
```typescript
this.monthlyService.addBranch(456, {
  branchCode: '001',
  openDate: '2026-01-01T00:00:00',
  periodId: 789
}).subscribe(() => {
  console.log('Branch added to light income');
});
```

**Notes:**
- Associates a branch with light monthly income
- Multiple branches can be added to same income period

---

### 5.5 Delete Branch

**Endpoint:** `DELETE /monthly-income/branch/{branchId}`
**Service:** `monthly.service.ts::deleteBranch()`

**Path Parameters:**
- `{branchId}` - Branch ID to delete

**Example:**
```typescript
this.monthlyService.deleteBranch(999).subscribe(() => {
  console.log('Branch deleted');
});
```

---

### 5.6 Delete Monthly Income Item

**Endpoint:** `DELETE /monthly-income/income-item/{monthId}`
**Service:** `monthly.service.ts::deleteIncome()`

**Path Parameters:**
- `{monthId}` - Monthly income item ID to delete

**Example:**
```typescript
this.monthlyService.deleteIncome(888).subscribe(() => {
  console.log('Monthly income deleted');
});
```

---

## 6. Report APIs

### 6.1 Account Invoice/Credit Reports

**Endpoint:** `GET /report/account/{compType}/invoices`
**Service:** `oi-account-report.service.ts::getInvoices()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  reportType: 'invoice' | 'credit'
}
```

**Response:**
```typescript
TInvocieReport[]
```

**Example:**
```typescript
// Get invoice reports
this.reportService.getInvoices('DN', 'invoice').subscribe(reports => {
  console.log('Invoice reports:', reports);
});

// Get credit note reports
this.reportService.getInvoices('DN', 'credit').subscribe(reports => {
  console.log('Credit reports:', reports);
});
```

---

### 6.2 Account Receipt Reports

**Endpoint:** `GET /report/account/{compType}/receipts`
**Service:** `oi-account-report.service.ts::getReceipts()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Response:**
```typescript
TReceiptReport[]
```

**Example:**
```typescript
this.reportService.getReceipts('DN').subscribe(reports => {
  console.log('Receipt reports:', reports);
});
```

---

### 6.3 Annual Report

**Endpoint:** `GET /report/account/{compType}`
**Service:** `oi-account-report.service.ts::getAnnualReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  year: string  // Format: "2026"
}
```

**Response:**
```typescript
TAnnualReport[]
```

**Example:**
```typescript
this.reportService.getAnnualReport('DN', '2026').subscribe(reports => {
  console.log('Annual report for 2026:', reports);
});
```

---

### 6.4 Light-Box Annual Report

**Endpoint:** `GET /report/account/{compType}/annual/light-box`
**Service:** `oi-account-report.service.ts::getLightBoxReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  year: string  // Format: "2026"
}
```

**Response:**
```typescript
TLightBoxReport[]
```

---

### 6.5 Annual Income Report

**Endpoint:** `GET /report/account/{compType}/annual`
**Service:** `oi-account-report.service.ts::getAnnualIncomeReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  year: string  // Format: "2026"
}
```

**Response:**
```typescript
TAnnualIncomeReport[]
```

---

### 6.6 Monthly Buy List Report

**Endpoint:** `GET /report/account/{compType}/month/buy-list`
**Service:** `oi-account-report.service.ts::getMonthlyBuyReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  month: string  // Format: "2026-01"
}
```

**Response:**
```typescript
TMonthBuyReport[]
```

**Example:**
```typescript
this.reportService.getMonthlyBuyReport('DN', '2026-01').subscribe(reports => {
  console.log('January 2026 buy list:', reports);
});
```

---

### 6.7 Monthly Income Report

**Endpoint:** `GET /report/account/{compType}/month/ince`
**Service:** `oi-account-report.service.ts::getMonthlyInceReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  month: string  // Format: "2026-01"
}
```

**Response:**
```typescript
TMonthInceReport[]
```

---

### 6.8 Bill Report by Date Range

**Endpoint:** `GET /report/account/{compType}/range/bill`
**Service:** `oi-account-report.service.ts::getBillRangeReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  startDate: string  // Format: "2026-01-01"
  endDate: string    // Format: "2026-01-31"
}
```

**Response:**
```typescript
TRangeBillReport[]
```

**Example:**
```typescript
this.reportService.getBillRangeReport('DN', '2026-01-01', '2026-01-31')
  .subscribe(reports => {
    console.log('Bill report for January:', reports);
  });
```

---

### 6.9 Product Report by Date Range

**Endpoint:** `GET /report/account/{compType}/range/product`
**Service:** `oi-account-report.service.ts::getProductRangeReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  startDate: string  // Format: "2026-01-01"
  endDate: string    // Format: "2026-01-31"
}
```

**Response:**
```typescript
TRangeBillReport[]  // Same structure as bill report
```

---

### 6.10 Invoice-Receipt Report by Date Range

**Endpoint:** `GET /report/account/{compType}/range/inv-rece`
**Service:** `oi-account-report.service.ts::getInvReceRangeReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  startDate: string
  endDate: string
}
```

**Response:**
```typescript
TRangeInvReceReport[]
```

---

### 6.11 Credit Report by Date Range

**Endpoint:** `GET /report/account/{compType}/range/credit`
**Service:** `oi-account-report.service.ts::getCreditRangeReport()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`

**Query Parameters:**
```typescript
{
  startDate: string
  endDate: string
}
```

**Response:**
```typescript
TRangeCreditReport[]
```

---

### 6.12 Monthly Supplier Report

**Endpoint:** `GET /report/supplier/{compType}/{compCode}`
**Service:** `supplier-report.service.ts::getSupplierMonthly()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{compCode}` - Company code

**Query Parameters:**
```typescript
{
  month: string  // Format: "2026-01"
}
```

**Response:**
```typescript
TOiSupplierRes[] {
  head: TMonthHead
  summary: TOiSupplierSummary
}[]
```

**Example:**
```typescript
this.supplierReportService.getSupplierMonthly('DN', 'ABC001', '2026-01')
  .subscribe(reports => {
    console.log('Supplier monthly report:', reports);
  });
```

**Notes:**
- Provides monthly summary for specific supplier
- Used in supplier dashboards

---

### 6.13 Monthly Supplier Detail Report

**Endpoint:** `GET /report/supplier/monthly/{compType}/{compCode}/detail`
**Service:** `supplier-report.service.ts::getSupplierMonthlyDetail()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{compCode}` - Company code

**Query Parameters:**
```typescript
{
  month: string  // Format: "2026-01"
}
```

**Response:**
```typescript
TOiSupplierMonthDetialRes[] {
  head: TMonthHead
  summary: TOiSupplierDetial[]
}[]
```

**Notes:**
- More detailed breakdown than monthly report
- Shows transaction-level details

---

### 6.14 Annual Supplier Report

**Endpoint:** `GET /report/supplier/annual/{compType}/{compCode}`
**Service:** `supplier-report.service.ts::getSupplierAnnual()`

**Path Parameters:**
- `{compType}` - Company type: `DN` or `HU`
- `{compCode}` - Company code

**Query Parameters:**
```typescript
{
  year: string  // Format: "2026"
}
```

**Response:**
```typescript
TOiSupplierAnnualRes[] {
  head: TMonthHead
  monthly: TPivot<number>[]
}[]
```

**Example:**
```typescript
this.supplierReportService.getSupplierAnnual('DN', 'ABC001', '2026')
  .subscribe(reports => {
    console.log('Supplier annual report:', reports);
  });
```

**Notes:**
- Aggregates monthly data for the entire year
- Uses pivot table format for monthly breakdown

---

## Appendix A: Type Definitions

### Core Types

```typescript
// Company Types
type TCompType = 'DN' | 'HU';

// Company Information
type TOIComp = {
  compCode: string
  compName: string
  compType: string
  compName2: string
  compGroupCode: string
};

// Event Information
type TEvent = {
  id: number
  eventName: string
  eventType: number
};

// Income Information
type TIncome = {
  id: number
  incomeName: string
  incomeType: number
};

// Period Result
type TPeriodResult = {
  id: number
  periodName: string
  totalAmount: number
  totalIncome: number
  invAmount: number
  invDate: string | null
  orderAmount: number
  orderDate: string | null
  receAmount: number
  receDate: string | null
  creditAmount: number
  creditDate: string | null
  periodRemark: string
};

// Populated Period (with detail lists)
type TPopulatedPeriodResult = TPeriodResult & {
  orderList: TOrderItemDto[]
  invoiceList: TInviceItemDto[]
  receiptList: TReceiptItemDto[]
  creditList: TCreditNoteDto[]
};
```

### Date Format
All date fields use ISO 8601 format:
- Full timestamp: `2026-01-01T00:00:00`
- Date only in some contexts: `2026-01-01`
- Month format: `2026-01`
- Year format: `2026`

---

## Appendix B: Common Workflows

### Creating a Not-Light Contact with Period

```typescript
// Step 1: Create contact head
const head = await firstValueFrom(
  this.baseformService.insert({
    compCode: 'ABC001',
    compType: 'DN',
    compName: 'บริษัท ABC',
    eventId: 1,
    incomeId: 1,
    period: 4,
    startDate: '2026-01-01T00:00:00',
    endDate: '2026-12-31T23:59:59',
    displayName: 'ABC-2026',
    productList: ['G001']
  })
);

// Step 2: Add monthly income
await firstValueFrom(
  this.monthlyService.insertNotLight(head.id, {
    eventType: 1,
    calAmount: 100000,
    actualAmount: 5000,
    startDate: '2026-01-01T00:00:00',
    endDate: '2026-01-31T23:59:59',
    reason: 'January income',
    incomeAmount: 5000,
    cn: 0,
    receList: [{ calAmount: 5000, receNumb: 'REC-001' }]
  })
);

// Step 3: Create period
const period = await firstValueFrom(
  this.periodService.createPeriod(head.id, {
    periodName: 'Q1 2026',
    totalAmount: 100000,
    totalIncome: 5000,
    periodRemark: '',
    monthlyList: [{ id: 1, startDate: '2026-01-01', endDate: '2026-01-31' }]
  })
);

// Step 4: Add orders to period
await firstValueFrom(
  this.periodService.insertPo(period.periodId, [
    {
      orderNumb: 'PO-001',
      receNumb: 'REC-001',
      actualAmount: 5000,
      remark: ''
    }
  ])
);
```

---

**Last Updated:** 2026-01-08
**Maintained By:** Development Team
**Questions?** Contact: [Add contact info]
