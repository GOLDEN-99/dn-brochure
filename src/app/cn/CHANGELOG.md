# Changelog

All notable changes to the CN will be documented in this file.

## 2026-05-30

### Fixes

- cn.route.ts — corrected `'uplaod'` typo to `'upload'` in `cnGuard` type signature and route `canActivate` call
- cn.route.ts — guard fallback now navigates to `['/']` instead of empty string when parent URL is empty
- cn-state.service.ts — changed `providedIn: 'root'` to `providedIn: null` so the service is only injectable via the route-level provider, not as an accidental app-wide singleton
- cn-upload.component.ts — `disabled` now includes `invalidPrice()` so the submit button is blocked when `totalPrice === 0`
- partial-cancel-order.component.ts — fixed `laoding` typo (rename to `loading`) at declaration and both call sites
- partial-cancel-order.component.ts — removed dead `isWRR` signal that was declared but never used
- partial-cancel-order.component.ts — removed unused `signal` import after dead code removal

### Changes

- https://api.drugnetcenter.com/ReturnRequest/GetOrder?WholeNumb= has a meaning of goodAmou as a remaining item for current cancel request.
- cn-state.service.ts — max-amount ceiling now uses orderAmount directly (API returns net value; old - useItem was double-counting)
- cn-state.service.ts — removed whole-CN block that blocked full-bill returns when cnCount > 0
- cn-state.service.ts — removed amount < 0 guard (0 is valid for unchecked items)
- refactor utility function and type system

### Chores

- cn-state.service.ts — cleaned up unused imports (applyWhen, disabled, min)
- src/app/cn/CLAUDE.md — new doc describing module structure, user flow, and key design decisions

## 2026-05-29

### Changes

- moving from plain signal into a form signal to centralized validation rule
- project structure change form meaningless service and components into more meaningful. a cn-api-service as client endpoint, a cn-state holds multistep form across routes.
