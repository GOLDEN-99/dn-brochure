# Remark Category Filter

Status: **implemented** 2026-08-19 (opened 2026-08-06, was blocked on the
`GetCNRemark` spec). A category select above the remark dropdown filters the
reason list down to one group.

## What the API answered

`GET /GetCNRemark` now returns `{ id, remark, remarkGroup }`. Both open
questions resolved — and both guesses in the original scaffold were wrong:

| Question | Assumed | Actual |
| --- | --- | --- |
| Field name | `groupName` | **`remarkGroup`** |
| Join key | `REMARK_CATEGORIES[].label` (Thai string) | **`REMARK_CATEGORIES[].id`** (`'1'`–`'7'`) |

The label join was the silent-failure case flagged when this was opened: it
would have returned an empty array and blanked the dropdown with no error.
`remark-group.spec.ts` pins the id join and asserts the label join yields `[]`,
so a regression back to the label fails a test instead of blanking the UI.

The seven groups the API returns match `REMARK_CATEGORIES` exactly (61 options
across groups `'1'`–`'7'`).

## Prod has not shipped the field yet

`dev.drugnetcenter.com/ReturnRequest/GetCNRemark` returns `remarkGroup`;
`api.drugnetcenter.com/ReturnRequest/GetCNRemark` **does not** — it still
returns bare `{ id, remark }`.

So `remarkGroup` is typed **optional** on `TRemark`, and the filter degrades
instead of breaking:

- `hasRemarkGroup(remarks)` is false when no option carries a group → the
  category select does not render at all and the remark dropdown shows the full
  flat list, i.e. exactly today's production behaviour.
- The category select gains an explicit **ทั้งหมด** (`null`) option, so the
  unfiltered list is always reachable.

Once prod ships `remarkGroup` the filter appears on its own with no code
change. When prod has shipped it and dev/prod agree, `remarkGroup` can be made
required on `TRemark` and `hasRemarkGroup` dropped.

## Hard constraint — the submit payload did not change

`TCreateReq` and `mapFormToApiRequest` (`shared/libs/format-request.ts`) are
untouched. `mapFormToApiRequest` destructures only `id`/`remark` off
`remarkOpt`, so `remarkGroup` cannot reach the create body. The category
selection lives in `RemarkSelectComponent` local state and is never written to
the form.

## Where it lives

- `shared/libs/remark-group.ts` — `REMARK_CATEGORIES`, `filterRemarkByGroup`,
  `hasRemarkGroup`, `isInGroup`. Pure, tested, no Angular.
- `shared/components/remark-select/` — the two selects. Changing category
  clears a remark that no longer belongs to it (`isInGroup`), so a stale
  out-of-group reason cannot be submitted.

The scaffolding previously sat in `cn-state.service.ts` as unused
`REMARK_CATEGORIES` / `filterRemark` / `TExtendedRemarkResult`. All three are
gone — `TExtendedRemarkResult` extended `TRemarkResult` (`{ id, result }`, the
*result* dropdown type), but the group comes from `GetCNRemark`, whose shape is
`TRemark`. The field now sits on `TRemark`.

## Still open — needs the business user, not the API

Whether remarks `'37'`, `'47'`, `'48'` should join the exclusion list in
`shared/libs/remark-cn.ts`. The API gave us their labels but not the decision:

| id | group | label |
| --- | --- | --- |
| 37 | 2 | สินค้าชำรุดจากขนส่ง (ลูกค้ายกเลิกทั้งบิล) |
| 47 | 4 | ลูกค้าไม่รับ (สินค้าชำรุด) |
| 48 | 4 | ลูกค้าไม่รับ (สินค้าไม่เป็นแพ็ค) |

All three describe goods that physically come back, which by the existing rule
argues for **leaving them out** of the exclusion list — its current members
(`'19'`, `'30'`, `'31'`) are payment/installment data problems with no product
to return. Left unchanged pending confirmation; the TODO stays in
`remark-cn.ts`.

The two axes are still easy to conflate:

- `mapRemarkToResult` (`remark-result.ts`) — which options the **result
  dropdown renders**. `mustReject` means "render only ลูกค้าไม่รับ". It says
  nothing about whether the order can be CN'd.
- `mapRemarkToShowCN` (`remark-cn.ts`) — whether the **CN flow applies at
  all**.

A customer rejecting goods does not by itself mean the CN flow should be
skipped. Decide the two axes separately.
