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

So `remarkGroup` is typed **optional** on `TRemark`, and three separate places
degrade instead of breaking. All three are keyed off `hasRemarkGroup()`, and
all three matter — the category defaults to `'1'` and has no "show everything"
option, so a missed guard means an empty dropdown, not a cosmetic glitch:

- `RemarkCategorySelectComponent.show()` — the category select does not render
  at all when nothing carries a group.
- `filterRemarkByGroup` — returns the list unfiltered rather than matching
  `remarkGroup === '1'` against 61 `undefined`s and yielding `[]`.
- `isInGroup` — treats a remark with no group as in-group, so the
  clear-on-category-change effect does not wipe the user's reason on every
  mount.

Once prod ships `remarkGroup` the filter appears on its own with no code
change. When prod has shipped it and dev/prod agree, `remarkGroup` can be made
required on `TRemark`, and `hasRemarkGroup` and all three guards dropped.

## Default and validation

The category defaults to `REMARK_CATEGORIES[0]` (`'1'` เกิดจากคลัง) and the
dropdown has **no null option** — it is never empty in normal use. A
`required()` validator on `stepOne.remarkCategory` backstops that in case
something clears the field programmatically; `cn-state.service.spec.ts` pins
that it passes on an object value, since a `required()` that rejected objects
would disable ถัดไป permanently.

Changing category clears a reason that no longer belongs to it, so a stale
out-of-group reason cannot be submitted.

## The category lives in form state, not the component

`CreateCancelRequestComponent` is a plain (non-lazy) child of the layout route,
so navigating to step 2 destroys it and going back constructs a fresh one. A
component-local `signal()` for the category is therefore lost on every back
navigation — which is exactly what happened in the first cut of this feature.

`remarkCategory` lives in `CnStateService.formState.stepOne`. `CnStateService`
is provided on the **parent** layout route, so it outlives step 1 and the
selection survives, the same way `remarkOpt` already did. `CnLayoutComponent`
spreads `...stepOne` when the order data lands, so it survives that too.

It is form state purely for lifetime and validation — it is **not** submitted,
see the constraint below.

`CnApiService.getRemark()` is `shareReplay`-cached because two components now
read the list (the category select needs it for `hasRemarkGroup`), and because
it was previously refetched on every step-1 mount.

## Hard constraint — the submit payload did not change

`TCreateReq` and `mapFormToApiRequest` (`shared/libs/format-request.ts`) are
untouched. `mapFormToApiRequest` destructures `stepOne` field by field and
returns an explicit object literal, so neither `remarkGroup` nor the new
`stepOne.remarkCategory` can reach the create body — `remarkCategory` is in the
form for lifetime and validation only.

That explicit destructure is the thing keeping the payload frozen. If anyone
ever changes `mapFormToApiRequest` to spread `...form`, the category object
starts being submitted.

## Where it lives

- `shared/libs/remark-group.ts` — `REMARK_CATEGORIES`,
  `DEFAULT_REMARK_CATEGORY`, `filterRemarkByGroup`, `hasRemarkGroup`,
  `isInGroup`. Pure, tested, no Angular.
- `shared/components/remark-category-select/` — the หมวดสาเหตุ select, bound to
  `stepOne.remarkCategory`.
- `shared/components/remark-select/` — the สาเหตุ select. Takes the chosen
  category as an `input()` and filters on it.

Two components rather than one because `[formField]` maps a `FormValueControl`
to a single field, and these are two fields. `TRemarkCategory` is declared in
`types/cn.type.ts` rather than in `remark-group.ts` so that the lib imports the
types file and never the reverse — this repo already has one import cycle that
aborts the test suite, and adding a second is not worth the tidier location.

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
