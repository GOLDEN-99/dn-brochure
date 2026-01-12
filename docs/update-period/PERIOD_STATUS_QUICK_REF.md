# Period Status - Quick Reference Card

**Version:** 2.0.0 | **Date:** 2026-01-09

---

## 🆕 What's New

Period status is now based on **amounts**, not dates!

| Old (DEPRECATED) | New (CURRENT) |
|------------------|---------------|
| `if (period.invDate)` | `if (period.periodStatus === 4)` |
| `if (period.receDate && period.invDate)` | `if (period.periodStatus === 2)` |
| Date-based logic | Amount-based logic |

---

## 📊 Status Codes

```typescript
enum PeriodStatus {
  All = 1,        // Filter: Show all
  Complete = 2,   // Invoice + Receipt complete
  Invoice = 3,    // Waiting for invoice
  Receipt = 4     // Waiting for receipt
}
```

---

## 🔄 Status Transitions

```
┌─────────┐  total_income    ┌─────────┐  invoice_amount  ┌──────────┐
│ Invoice │  = invoice_amount│ Receipt │  = rece_amount   │ Complete │
│  (3)    ├─────────────────→│  (4)    ├─────────────────→│   (2)    │
└─────────┘                   └─────────┘                   └──────────┘
   ↑                             ↑                              ↑
   │                             │                              │
 Still waiting              Partial receipt                Full payment
```

---

## 💻 Code Snippets

### Display Status Badge

```typescript
getStatusLabel(period: PeriodDto): string {
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
```

### Filter Periods

```typescript
// Get periods waiting for invoice
GET /period/DN?filter=3

// Get periods waiting for receipt
GET /period/DN?filter=4

// Get completed periods
GET /period/DN?filter=2
```

### Manual Override

```typescript
async forceComplete(periodId: number) {
  await this.http.patch(
    `${environment.oi}/period/${periodId}/status`,
    { Status: 2 }  // Force to Complete
  ).toPromise();
}
```

---

## ⚠️ Important Notes

1. **Bill/Product periods** (income_type 1/2) → `periodStatus` is `null`
2. **Dates still exist** (`invDate`, `receDate`) for audit trail
3. **No code changes needed** for adding invoices/receipts
4. **Status updates automatically** when amounts match

---

## 🔧 Migration Steps

1. Add `periodStatus?: PeriodStatus | null` to your `PeriodDto` interface
2. Replace all date-based status checks with `periodStatus` field
3. Update status badge components
4. Test filtering by status

---

## 📚 Full Documentation

- [Complete Migration Guide](./PERIOD_STATUS_UPDATE.md)
- [API Changelog](./CHANGELOG.md)
- [API Reference](./API_REFERENCE.md)

---

**Need Help?** Check the full documentation or contact the backend team.
