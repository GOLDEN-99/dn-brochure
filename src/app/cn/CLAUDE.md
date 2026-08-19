# CN Module

Credit Note (CN) request feature. Allows sales reps to initiate a return/cancellation for a wholesale order.

## Docs

- `docs/remark-category-filter.md` — remark-group filter. Read before touching
  the remark mappers or `format-request.ts`. Records that `GetCNRemark` keys
  the group by **id** (`remarkGroup`, `'1'`–`'7'`) not by Thai label, that prod
  has not shipped the field yet so the filter must degrade, and why
  `mapRemarkToResult` and `mapRemarkToShowCN` are separate axes.

## Folder Structure

```
src/app/cn/
├── routes/
│   └── cn.route.ts              Route definitions + inline cnGuard
├── features/
│   ├── create-cancel-request/   Step 1: remark, cn-type, customer status
│   ├── whole-cancel-order/      Step 2a: confirm whole-bill CN + upload + submit
│   ├── partial-cancel-product-picker/  Step 2b: select products for partial CN
│   ├── partial-cancel-order/    Step 3b: enter return quantities + upload + submit
│   └── cn-upload/               Upload-only flow (no CN, manual refund amount)
└── shared/
    ├── components/
    │   ├── cn-layout/           Root wrapper — loads GetOrder + GetWhole on init
    │   ├── cn-type-radio/       Radio: whole vs partial
    │   ├── cn-product-picker/   Barcode search to add extra products
    │   ├── good-item/           Product card with return-amount input
    │   ├── image-uploader/      Upload receipt images
    │   ├── remark-select/       Category filter + return reason dropdown
    │   └── result-select/       Result-type dropdown (shown conditionally on remark)
    ├── services/
    │   ├── cn-state.service.ts  All form state + validation schemas (signal-based)
    │   ├── cn-api.service.ts    HTTP: GetOrder, GetWhole, GetBarCode, CreateWholeRequest
    │   └── cn-upload-image.service.ts  Image blob upload
    ├── libs/
    │   ├── parse-cn-param.ts    Zod schema for route params
    │   ├── remark-result.ts     Map remark.id → result type ('all' | 'notAccept' | 'notChange' | 'mustReject')
    │   ├── remark-cn.ts         Map remark.id → showCN boolean
    │   ├── remark-group.ts      REMARK_CATEGORIES + filter remark list by remarkGroup
    │   ├── format-request.ts    Map form stepOne → API request shape
    │   └── good-item.lib.ts     TGoodItem (with lots) → TGoodItemState (aggregated)
    └── types/
        └── cn.type.ts           All domain types
```

## User Flow

1. Route `/cn/:saleCode/:wholeCode/:wholeNumb/:isWRR` → `CnLayoutComponent` loads order data
2. `CreateCancelRequestComponent` — select remark, result type, CN type, customer transfer status
3. Based on `CnStateService.endPoint()`:
   - `'whole'`  → `WholeCancelOrderComponent` (confirm all products → upload → submit)
   - `'some'`   → `PartialCancelProductPickerComponent` (pick products) → `PartialCancelOrderComponent` (amounts → upload → submit)
   - `'upload'` → `CnUploadComponent` (upload images + manual amount, no product list)
4. On success → top-level `cn/complete` route (outside layout)

## Key Design Decisions

**Single state service**: `CnStateService` is provided on the layout route, so it is scoped to the CN session and destroyed on exit. All form state and computed values live here.

**Signal-based forms**: Uses `@angular/forms/signals` (`form`, `schema`, `validate`, `required`, etc.) for reactive validation without `ReactiveFormsModule`.

**No lot selection**: The original implementation had per-lot checkboxes (`LotItemComponent`). This version removes lot granularity — users enter one return quantity per product. `mapGoodItemToState()` sums all lots into a single `orderAmount`.

**API returns net `goodAmou`**: `/GetOrder` returns `lot.goodAmou` already net of prior cancellations (gross − `useItem`). The max-amount ceiling is `orderAmount` directly — do **not** subtract `useItem` again.

**Route guard**: `cnGuard` (co-located in `cn.route.ts`) checks `endPoint()` before activating any sub-route. If the user hasn't completed step 1 or tries to navigate directly to the wrong sub-route, they are redirected to step 1.

## Form Shape (`TCreateCancelForm`)

```ts
{
  metadata: { isWRR, bankAcName, bankCode, bankNumb, code, name,
              wholeCode, wholeDate, wholeName, wholeNumb, saleCode }  // readonly
  stepOne:  { remarkOpt, resultAll, resultNotAccept, resultNotChange,
              resultMustReject, cnType, remark, cnCount, cusStat }
  returnList: Array<{ good: TGoodItemState, amount: number, check: boolean }>
  image: string[]
}
```

`cnCount` = sum of all `useItem` values — stored for display only, not used in validation.

## Submission

Both whole and partial flows call `CnApiService.submit()` → `POST /CreateWholeRequest`. The `goodList` payload uses `TGoodItemReq` (no `lotNumber`/`expiDate` — lot fields are removed from the request).
