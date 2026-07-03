# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 21 (standalone components, signals-based) frontend for internal Drug Net Center tooling: product brochure/marketing, CN (credit note / return) requests, supplier stock transfers (IB/OB), quota items, CRM promotions, and Other Income (supplier-funded income tracking). Node 22.22.0.

## Commands

```bash
npm start                # ng serve, http://localhost:4200
npm run build             # ng build --configuration production
npm run watch              # ng build --watch --configuration development
npm test                   # ng test (Karma + Jasmine)
```

Run a single spec file: `ng test --include='**/cn-state.service.spec.ts'`

Other Income v2 has its own spec tsconfig (`tsconfig.spec.other-income.json`, includes only `src/app/other-income/**/*.spec.ts`) — used when scoping test runs to that module.

## Architecture

### Multi-domain monolith, feature-folder structure

`src/app/` hosts several largely-independent feature domains side by side, each with its own routes file mounted into `src/app/app.routes.ts`: `brochure`, `cn`, `routes/supplier.route.ts`, `routes/inbound.route.ts`, `routes/other-income.route.ts` (legacy v1), `other-income/routes/other-income.route.ts` (v2 rewrite), `routes/stock-item.route.ts`, `routes/quota-item.route.ts`, `routes/crm-promotion.route.ts`. Legacy pages live under `src/app/pages/<domain>/`; newer modules (`cn`, `other-income`) are self-contained top-level folders with their own `routes/`, `shared/`, `features/` or `purchase`/`account` subtrees.

**Other Income has two live versions mounted in parallel**: `src/app/routes/other-income.route.ts` (v1, legacy, mounted at `other-income`) and `src/app/other-income/routes/other-income.route.ts` (v2 rewrite, mounted at `v2/other-income`). They are intentionally decoupled — do not assume shared state or components between them. See `src/app/other-income/CLAUDE.md` for the v2 architecture, business context docs (`src/app/other-income/docs/context/*.md`, start with `settlement-reference.md` for anything settlement-related), and known gaps.

**Shared UI components can be silently shared across unrelated domains.** `src/app/components/crm-promotion/` (e.g. `SignalMonthPickerComponent`, `FormAlertTextComponent`) and `src/app/components/date-input/` are used both by legacy `src/app/pages/crm-promotion/` and by `other-income` v2 forms. Changing these in place for one module's needs can silently break the other — this has happened before. Prefer adding new module-scoped components under that module's own `shared/components/` instead of editing shared `components/*` files in place.

Nested `CLAUDE.md` files exist for individual modules and should be read when working in them:
- `src/app/cn/CLAUDE.md` — CN (credit note / return request) module
- `src/app/other-income/CLAUDE.md` — Other Income v2 module
- `src/app/other-income/shared/libs/CLAUDE.md` — `ContractListController` URL-driven filter/pagination pattern

### State management conventions (see `note.md` for the full guideline doc)

- **Synchronous state**: signals throughout — `signal()`, `computed()`, `input()`/`output()`/`model()`. No `ReactiveFormsModule`; complex forms use `@angular/forms/signals` (`form`, `schema`, `validate`, `required`) — see `provideSignalFormsConfig` in `app.config.ts` and `CnStateService` in the CN module for a reference implementation.
- **Async state**: `Observable` → `toSignal()` for template consumption; `Resolver` for route-level data prefetch (flow: Resolver → Service → Component). Mutations (POST/PUT/DELETE) use `.subscribe()` with explicit loading/error handling.
- **No global store.** Feature/route-scoped state lives in per-feature "state"/"context" services provided at the route level (`providers:` on route config), torn down on navigation away — e.g. `CnStateService`, `OrderContractContextService`, `SettlementContextService`. Where multiple contract-type context services need to expose a common shape to shared components, an injection token + `useExisting` is used (`FOR_CONTRACT_DATA_TOKEN` in `other-income/tokens/service-token.ts`) rather than a shared base class.
- **Validation**: zod schemas (e.g. `other-income/shared/libs/other-income-schema.ts`), plus signal-forms schema validators for complex forms.
- List pages with filtering/pagination should use the `ContractListController` pattern (`other-income/shared/libs/contract-list-controller.ts`) rather than ad hoc local signals — see that folder's `CLAUDE.md` for why and how.

### API endpoints (`src/environments/environment.ts`)

| Key | Base URL | Domain |
| --- | --- | --- |
| `brochureEndpoint` | `api.drugnetcenter.com/ItemService2` | Product/Item |
| `imagePath` | `file.drugnetcenter.com/drugpos/GoodPictures` | Product images |
| `cnPath` | `api.drugnetcenter.com/ReturnRequest` | CN / return requests |
| `ibob` | `api.drugnetcenter.com/IbOb` | IB/OB transfers |
| `oi` | `api.otherincome.healthupgroup.com` | Other Income |

Other Income v2 API reference docs live at repo root `docs/API_REFERENCE.md`, `docs/EXAMPLES.md`, `docs/CHANGELOG.md` (marked stale relative to `src/app/other-income/docs/` — prefer the in-module docs for anything settlement-related).

### Testing conventions

- New components/services/utilities require unit tests; add tests when modifying existing untested code.
- Test behavior, not implementation; mock services/HTTP calls; test signal reactivity/computed values.
- Common mocks (see `note.md` for full snippets): `jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'])`; `ActivatedRoute` provided as a plain object with `params`/`queryParams`/`data` as `of(...)` and a `snapshot`; API services as `jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete'])`.
- Much of the newer Other Income correction-flow code (CN/lag/manual correction) currently ships with no test coverage — check before assuming a `.spec.ts` exists for a file you're changing.

### Lazy-loaded routes

Routes are loaded via `loadComponent()` wrapped in `.catch(handleLazyLoadError(...))` (`src/app/utils/lazy-load-error-handler.ts`) — a chunk-load failure (common after a deploy invalidates old chunk hashes) triggers a full page reload rather than a dead route. The same failure class is also caught globally in `CustomGlobalErrorHandler` (`app.config.ts`).
