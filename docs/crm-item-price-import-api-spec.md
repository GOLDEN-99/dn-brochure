# CRM item-price import — API contract (v1)

Backend: other-income-api, base `environment.oi + '/crm'`. JSON is camelCase (ASP.NET default);
dates are ISO strings (`"2026-10-01"` accepted on input, `"2026-10-01T00:00:00"` on output).
Design and rationale: workspace-root `CRM-ITEM-PRICE-IMPORT-PLAN.md`.

The feature: marketing uploads an Excel of product codes + promotion price; each row becomes one
`ITEM` / `ITEMEXIST` / `ITEMPRICE` promotion (chain-wide in v1). The user validates against the
good's price ladder (price1…price6, A/B/C) before issuing. Issue is fire-and-forget: the `POST`
returns `202` and the client polls the request until a terminal status.

## 1. `POST /crm/item-price-requests/resolve` — stateless validation view

Request

```jsonc
{
  "startDate": "2026-10-01",
  "endDate": "2026-10-31",
  "promotionOrder": 1,                    // optional; sharpens the overlap `outcome` (omitted = 0)
  "lines": [
    { "rowNumber": 2, "barcode": "408569", "price": 2199.00, "name": null },
    { "rowNumber": 3, "barcode": "501004", "price": 12.00,   "name": null, "unitCodes": ["13"] }
  ]
}
```

`unitCodes` (optional, since 2026-10-07 — CRM-PROMOTION-UNIT-PLAN.md §1.5): a good is resolved to
**every unit it is sold in** (each `goodAmou = 1` `GoodBarcode` unit — strip and box), one response
row per unit. When the user removes a unit's row in the validation table, send the units that are
left here; omitted or empty = all units. Naming a unit the good no longer has is an `ERROR`
`UNIT_NOT_SOLD`.

Response — one entry per (input line, unit), in input order; a good sold in N units yields N rows
sharing `rowNumber`, `splitSeq` 1..N, `splitCount` N — show "เพิ่ม N แถวจาก 1" on them. The sheet
price is **not** scaled by `unitFactor`; each row is judged against **its own unit's** ladder (a
pack row carries the pack's own total price), so the box row of a strip price is normally a `SKIP`
`NO_BRANCH_ABOVE_PRICE`.

```jsonc
{
  "rows": [
    {
      "rowNumber": 2,
      "barcode": "408569",
      "price": 2199.00,
      "name": null,
      "status": "OK",                       // "OK" | "SKIP" | "ERROR"
      "reasonCode": null,                   // see codes below
      "reason": null,                       // Thai text for the table
      "matchedBy": "GOODINFO",              // "GOODINFO" | "GOODBARCODE" | null
      "goodCode": "000123",
      "goodName": "…",
      "competitiveGroup": "-",              // "-" | "A" | "B" | "C"
      "unitCode": "3",                      // GoodBarcode.unitCode of this row's unit; null on an ERROR row
      "unitDesc": "แผง",                    // UnitInfo.unitDesc
      "unitFactor": 1,                      // UnitInfo.unitFactor (1 = base unit; a box of 10 = 10)
      "unitBarcode": "408569",              // the unit's own scan code (a pack unit has no 6-digit code)
      "splitSeq": 1,                        // 1..splitCount
      "splitCount": 1,                      // > 1 = this sheet row was split into one row per unit
      "ladder": { "price1": 2500, "price2": 2400, "price3": 2350, "price4": 2300,
                  "price5": 2250, "price6": 2100, "priceA": 0, "priceB": 0, "priceC": 0 },
      "levels": [                           // the human view: good × applied level
        { "level": "1", "memberPrice": 2500, "walkInPrice": null, "branchCount": 14, "qualifies": true,  "inScope": true },
        { "level": "3", "memberPrice": 2350, "walkInPrice": 2400, "branchCount": 45, "qualifies": true,  "inScope": true },
        { "level": "4", "memberPrice": 2150, "walkInPrice": 2350, "branchCount": 8,  "qualifies": false, "inScope": true },
        { "level": "5", "memberPrice": 2100, "walkInPrice": 2250, "branchCount": 3,  "qualifies": false, "inScope": false }
      ],
      "branchesAbove": 59,                  // member price above the promo
      "branchesBelow": 11,                  // member price at or below
      "branchesInScope": 67,                // the promotion is created for these (>= branchesAbove)
      "overlapping": [                      // active ITEM promotions on the same good in the window
        { "id": 131, "promotionName": "…", "action": "ITEMPRICE", "rewardValue": 2299,
          "promotionPriority": 0, "promotionOrder": 1,
          "startDate": "2026-09-01T00:00:00", "endDate": "2026-10-15T00:00:00",
          "outcome": "EXISTING_WINS" }      // "EXISTING_WINS" | "NEW_WINS" | "STACKS" | "EXISTING_SETTLES_GROUP"
      ]
    }
  ],
  "summary": { "total": 300, "ok": 280, "skip": 15, "error": 5 }
}
```

`reasonCode` values from the server: `BARCODE_NOT_FOUND`, `AMBIGUOUS_CODE`, `GOOD_INACTIVE`,
`NO_BASE_UNIT_BARCODE` (the good has no `GoodBarcode` row with `goodAmou = 1` at all),
`UNIT_NOT_SOLD` (a `unitCodes` entry the good no longer has) — all status `ERROR`;
`NO_BRANCH_ABOVE_PRICE`, `UNIT_UNPRICED` (this unit's `price1 = 0`: nothing to be below; the row
still carries its zero ladder) — status `SKIP`. The client adds its own before calling:
`DUPLICATE_IN_FILE`, `INVALID_PRICE`, `EMPTY_BARCODE` (status `ERROR`) — those rows are not sent.
`DUPLICATE_IN_FILE` is still per sheet barcode: one Excel row = one good, however many units.

`ladder`, `levels`, `goodCode`, `goodName`, `unitCode` are `null` when the good was not resolved.
`overlapping` lists only promotions on the same **(good, unit)**; one stored before units existed
(unit not yet backfilled) is listed against every unit.
`walkInPrice` is `null` for level 1 (the server cannot compute the uplift).
`qualifies`: member price strictly above the promo. `inScope`: the promotion is created for this
level — every numeric level up to the highest qualifying level **+ 1, capped at 6** (the walk-in at
a member-only-price branch pays one level dearer); the till never raises a price, so the extra
level is a no-op where it does not apply. The promotion is created `isBranchSpecific: true` with
exactly the branches whose applied level is in scope, taken again at issue time. The branch codes
are not returned; the page shows counts only.
`overlapping` is `[]` when none; `outcome` semantics in the plan §4.1a. Overlap is a **warning**,
never blocks.

## 2. `POST /crm/item-price-requests` — store and issue (202)

Request: the header + the lines the user kept (excluded rows are not sent). The server
re-resolves every line itself; it never trusts client ladder values.

```jsonc
{
  "name": "โปรตุลา 2026",
  "startDate": "2026-10-01",
  "endDate": "2026-10-31",
  "source": "SUPPLIER",                  // "HU" | "SUPPLIER" | "BOTH"; HU forces promotionOrder 0
  "promotionOrder": 1,
  "activeDay": "1111111",
  "createdBy": "1715",                   // signed-in emplCode; may be omitted, server defaults to "1715"
  "lines": [ { "rowNumber": 2, "barcode": "408569", "price": 2199.00, "name": null, "unitCodes": null } ]
}
```

Response `202 Accepted`

```jsonc
{ "id": 17 }
```

Validation errors come back as `400` in the existing shape:
`{ "error": "bad req", "statusCode": 40000, "message": "…", "errors": { "field": ["…"] } }`.

Promotion shape written per line (for reference): `promotionType ITEM`, `action ITEMPRICE`,
`thresholdType ITEMEXIST`, `isRepeat true`, `promotionPriority 0` (pinned), one tier
`{ thresholdValue 0, rewardValue <price> }`, one `EXIST` filter with the single good,
`isBranchSpecific false`, name `{name}-{barcode}` unless the row carries `name`.

## 3. `GET /crm/item-price-requests/{id}` — detail, polled while running

```jsonc
{
  "id": 17,
  "name": "โปรตุลา 2026",
  "startDate": "2026-10-01T00:00:00",
  "endDate": "2026-10-31T00:00:00",
  "source": "SUPPLIER",
  "promotionOrder": 1,
  "activeDay": "1111111",
  "status": "ISSUING",                  // "QUEUED" | "ISSUING" | "ISSUED" | "ISSUED_WITH_SKIPS" | "FAILED"
  "createdBy": "1715",
  "createdAt": "2026-09-29T10:00:00",
  "issueStartedAt": "2026-09-29T10:00:01",
  "issueFinishedAt": null,
  "issueError": null,
  "issuedCount": 120,
  "skippedCount": 3,
  "totalCount": 300,
  "lines": [
    {
      "id": 901, "rowNumber": 2, "barcode": "408569", "price": 2199.00, "name": null,
      "goodCode": "000123", "goodName": "…",
      "resolveStatus": "OK",            // "OK" | "SKIP" | "ERROR"
      "reasonCode": null, "reason": null,
      "promotionId": 131,               // null until issued
      "ladder": { "price1": 2500, "price2": 2400, "price3": 2350, "price4": 2300,
                  "price5": 2250, "price6": 2100, "priceA": 0, "priceB": 0, "priceC": 0 },
      "unitCode": "3", "unitDesc": "แผง", "unitFactor": 1,   // this line's unit (null on an ERROR line)
      "splitSeq": 1, "splitCount": 1    // > 1 = one of several lines stored for the same sheet row
    }
  ]
}
```

Lines are ordered by `rowNumber`, then `splitSeq`. The issued promotion names the pair
(`good_code`, `unit_code`); a split line's default name is `{campaign}-{barcode}-{unitDesc}`.

Terminal statuses: `ISSUED`, `ISSUED_WITH_SKIPS`, `FAILED`. Poll every 3 s while `QUEUED` /
`ISSUING`. `404` in the existing not-found shape when the id does not exist.

## 4. `GET /crm/item-price-requests` — list, newest first

```jsonc
[
  { "id": 17, "name": "โปรตุลา 2026", "startDate": "2026-10-01T00:00:00", "endDate": "2026-10-31T00:00:00",
    "source": "SUPPLIER", "status": "ISSUED_WITH_SKIPS", "createdBy": "1715",
    "createdAt": "2026-09-29T10:00:00", "issuedCount": 297, "skippedCount": 3, "totalCount": 300 }
]
```

## 5. `POST /crm/item-price-requests/{id}/retry` — 202

Allowed only when `status = "FAILED"`; re-queues the request (idempotent: only lines without a
`promotionId` are issued). Returns `202 { "id": 17 }`, `400` otherwise.
