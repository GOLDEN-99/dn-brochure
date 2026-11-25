# Inbound-Outbound Module (goods-receiving slots)

Replacement of the old IB/OB booking screens (removed 2026-11-25, nobody used them). Laid out like
`src/app/other-income/` (v2): one self-contained folder with `routes/`, a subtree per role, and
`shared/`. Backend: other-income-api `InboundOutbound/` at `${environment.oi}/inbound-outbound`.

The rule, the survey numbers behind it and what is still undecided live with the API:
`other-income-api/InboundOutbound/docs/receiving-slot-design.md` (why) and
`receiving-slot-api.md` (shapes — `shared/types/receiving.type.ts` mirrors it).

## What exists

Only the **warehouse** role so far: `/inbound-outbound/warehouse/board`.

```
src/app/inbound-outbound/
├── routes/inbound-outbound.route.ts     Mounted in app.routes.ts; employee gate (same as Other Income v2)
├── warehouse/
│   ├── warehouse.routes.ts
│   ├── components/
│   │   ├── forms/walk-in-check-in-form/   Truck without a booking
│   │   └── pages/receiving-board-page/    Check-in, queue, gates — the gate-house screen
│   └── services/receiving-api.service.ts
└── shared/
    ├── libs/receiving.util.ts           Labels, size preview, gate split, error text (pure, tested)
    └── types/receiving.type.ts
```

Purchasing (arrival memo per PO) and supplier (confirmation page from the PO e-mail) are the next
subtrees; they mount beside `WAREHOUSE_ROUTES`.

## Rules worth knowing before changing the board

- **The API orders the queue.** `board.queue` arrives in calling order (booked and on time first,
  then arrival time). Do not re-sort it here.
- **The supplier never picks a gate.** A gate is chosen on this screen when the truck is called.
  Free gates are one click; a gate that already has a truck takes two (arm, confirm) and sends
  `force: true`.
- Cancel is two clicks as well. No modals on this screen.
- Every write reloads the board, success or failure: a refusal (400/409 `{ error }`) means the
  screen was stale. The board also refreshes every 30 s.
- The warehouse code `BMS` is a constant in the page (`WAREHOUSE_CODE`); there is one receiving
  warehouse. The size cut points come from `GET /config`, never hardcode them.
- The supplier name is free text on purpose: a distributor truck (Zuellig, DKSH, DKLL) carries many
  vendor codes, and one truck can carry DN and HU bills together.

## Not to be confused with

`src/app/routes/inbound.route.ts`, `components/inbound-outbound/`, `service/ibob/` and
`environment.ibob` are the **supplier registration** leftovers of the old IB/OB project (backend
dn.api `/IbOb`). They are unrelated to this module.
