# Remark Category Filter — Blocked on API Spec

Status: **blocked**, opened 2026-08-06. A `RemarkCategory` select that filters
the remark dropdown down to one group. Scaffolding is committed but **not
wired into any component** — it is inert until the API spec below lands.

Do not build against the assumed field name. Two independent things need
confirmation, and one of them fails silently if guessed wrong.

## Hard constraint — the submit payload does not change

`TCreateReq` and `mapFormToApiRequest` (`shared/libs/format-request.ts`) keep
their current shape. The create request at the end of the flow still sends
`probOption` exactly as it does today.

Whatever the new spec adds is **display/filter metadata only**. It must not
reach the submit body. Confine the change to the fetch/filter path
(`CnApiService.getRemark` → `RemarkSelectComponent`).

## What needs confirming from backend

`GET /GetCNRemark` (`environment.cnPath`) currently returns `TRemark`
(`{ id, remark }`).

### 1. The field name

Assumed: each option gains `groupName: string`. Modelled as
`TExtendedRemarkResult` in `shared/types/cn.type.ts`, carrying a
`//TODO: confirm api shape` marker.

### 2. The join key — the one that fails silently

`filterRemark` in `shared/services/cn-state.service.ts` joins on the **Thai
label string**:

```ts
remarks.filter(({ groupName }) => groupName === cate.label)
```

But `REMARK_CATEGORIES` also carries `id: '1'`–`'7'`, so the API may key the
group by id instead. If it does, the filter returns an empty array rather
than throwing — the dropdown just goes blank with no error anywhere. Ask for
the field name and the join key in the same round-trip.

The seven categories the UI expects:

| id | label |
| --- | --- |
| 1 | เกิดจากคลัง |
| 2 | เกิดจากสินค้า |
| 3 | สินค้าชำรุด |
| 4 | เกิดจากลูกค้า |
| 5 | เกิดจากเทเล |
| 6 | เกิดจากเซล |
| 7 | โอนเงินล่วงหน้า |

## Separately open — needs the business user, not the API

Whether the new remark group (`'37'`, `'47'`, `'48'`) should join the
exclusion list in `shared/libs/remark-cn.ts`. Tracked as a TODO in that file.

This is a **different axis** from the result mapping, and the two are easy to
conflate:

- `mapRemarkToResult` (`remark-result.ts`) — which options the **result
  dropdown renders**. `mustReject` means "render only ลูกค้าไม่รับ". It says
  nothing about whether the order can be CN'd.
- `mapRemarkToShowCN` (`remark-cn.ts`) — whether the **CN flow applies at
  all**. Its exclusions (`'0'`, `'19'`, `'30'`, `'31'`) are payment/installment
  data problems (`'19'` = invalid installment, `'30'`/`'31'` = invalid bank
  payment) where there is no product to return.

A customer rejecting goods does not by itself mean the CN flow should be
skipped. Decide the two axes separately, and answer this one from the
remark's real label — which lives behind `GET /GetCNRemark`, not in the repo.

## When the spec arrives

1. Confirm the field name **and** the join key before writing code.
2. Update `TExtendedRemarkResult` and `filterRemark` together; drop both TODOs.
3. Wire the category select into `RemarkSelectComponent`.
4. Leave `format-request.ts` alone.
