# What fixing the unit suite exposed

Written after taking the suite from "crashes after 7 tests" to 309 green. Everything here was
hit directly while doing that; each item names the evidence so it can be re-checked.

The recurring theme: **the production build tolerates things the test bundle does not.** Lazy
loading, route-level providers, and deep route nesting all mean a component can work in the app
while being impossible to construct in isolation. That gap is where the defects were hiding.

---

## 1. The suite was dark, and that hid everything else

A circular import — `crm-promotion.route.ts` imported `CrmPromotionLayoutComponent`, which
imported `CREATE_ROUTE_PATH` back from the route module — threw at bundle load and aborted the
whole Karma run after 7 tests. **147 spec files never executed.** The app build never noticed,
because lazy loading changes module evaluation order.

Two things follow:

- **Route modules should not export data that components import.** A route file already imports
  every component it mounts, so anything a component imports back is a cycle. Constants shared
  between a route and its components belong in a leaf module — that is what
  `src/app/routes/crm-promotion.path.ts` now is.
- **A red suite decays into a dark suite.** "74 failures" was not the real state; the real state
  was "we do not know". Whatever the CI gate ends up being, the number that matters is
  *tests executed*, not just tests passed.

## 2. Scaffold specs are counted as coverage but assert nothing

**104 of 128 spec files (81%) contain one test**, almost always the generated
`it('should create')`. They were committed as `ng generate` emitted them and never filled in.

This is worse than no test. It reports coverage, it costs CI time, and — as section 6 shows — a
`should create` on an unreachable component can pass forever while proving nothing. The AppComponent
spec still asserted the CLI's `<h1>Hello, dn-prochure</h1>` against a shell template that never
had an `h1`.

Suggested: when generating a component, either write a real assertion or delete the spec. A
missing spec is honest; an empty one is not.

## 3. Route-scoped DI is invisible from the component

Per `CLAUDE.md`, feature state lives in services provided at route level (`@Injectable()` with no
`providedIn`, or `providedIn: null`). That is a deliberate and reasonable choice, but it means
**a component does not declare what it needs to run** — the knowledge lives in a route file
somewhere else, and the only way to discover it is to construct the component and read the
`NG0201`.

Same for injection tokens: **all 15 `InjectionToken`s in the codebase are declared without a
factory default**, so a component that injects one hard-crashes anywhere it is not routed
exactly right.

Suggested: give tokens a `factory` default where a sensible one exists
(`new InjectionToken('x', { factory: () => ... })`), and keep the per-feature provider recipe next
to the feature rather than only in the route file.

## 4. Two components derive state from URL *position*

`BaseSupplierForm` (`src/app/lib/supplier/baseForm.ts:21`) flattens every segment along
`pathFromRoot` and reads **index 2** as the company type:

```
['', 'supplier', ':compType', 'form', 'product']
                  ^ urlList()[2].toUpperCase()
```

and several pages additionally do `route.pathFromRoot.map(s => s.url)[1]` and read *its* segment
`[1]` (`step-three-page.component.ts:24`, `supplier-layout.component.ts:17`).

This is positional coupling to the route tree. Re-nest those routes by one level — add a wrapper
layout, move the feature under a new prefix — and `compType` silently becomes the wrong string or
`undefined.toUpperCase()`. Nothing type-checks it.

Suggested: resolve `compType` once via a route `data`/param or an injection token and inject it,
instead of re-deriving it positionally in a base class. `src/app/testing/supplier-route.mock.ts`
documents the exact shape these assume, which is a workaround, not a fix.

## 5. `SupplierApiService` cannot be constructed by DI

It takes a constructor argument (`compType: string`), so it can only be provided as
`useFactory: () => new SupplierApiService('DN')` (`inbound.route.ts:15`). Providing the class the
normal way yields `NG0204: Can't resolve all parameters`, which does not hint at the cause.

Suggested: pass `compType` through an `InjectionToken` so the service stays injectable and
`providedIn`-able like everything else.

## 6. Dead code had been accumulating quietly, and one check nearly deleted live code

53 declarations across 137 files (~7,700 lines) had no import and no template usage anywhere —
brochure-rework leftovers, Other Income v1 pieces superseded by v2, contract detail pages replaced
by the tabbed layout in `11f4af6`, CRM promotion components never wired up.

It compounds: removing a component orphans whatever only it used. The cleanup took three rounds
before a scan came back empty.

Contributing causes worth naming:

- **Two Other Income versions run in parallel with no decommission plan** (`other-income` v1 and
  v2). v2's `other-income-purchase-period.service.ts` was a wholesale duplicate of v1's
  `period.service.ts`, types included.
- **Duplicate type names across modules make grep-based reasoning unsafe.** There are 20+ exported
  type names declared in more than one module; `TItem` is declared three times. Checking whether
  `TPeriodInvBatch` was still used returned 4 hits and looked live — but by *import path* every
  consumer resolved to a different module that declares the same name. The file was dead. **Verify
  by import path, not by symbol name.**
- Unreachable code is never corrected. `MemberCheckboxComponent` declared
  `members = input.required<TMember>()` while its body called `.reduce()`/`.map()` on it and cast
  results back with `as TMember` — the declared type was simply wrong, and nothing ever hit it.

## 7. Rendering moved between components; the tests did not follow

`85694e4` moved the income-types table out of all three `*-contract-specs-page` templates into the
three `*-contract-layout` components. The specs kept asserting rows that now render one level up,
and looked like six regressions.

**The layouts that received that rendering still have no spec**, so the behaviour went from tested
to untested without anything flagging it.

Suggested: when moving markup between components, move its assertions in the same commit.

---

## Recipes this produced

Applies to any new spec in this codebase:

- **Provider order matters.** `provideRouter([])` supplies `ActivatedRoute`; if you also provide a
  mock `ActivatedRoute`, it must come **after** `provideRouter([])` or it is silently overridden.
  This costs a confusing debugging round every time.
- **Route-scoped services** must be provided explicitly, the same way the route provides them —
  including `useFactory` where the route uses one.
- **Signal forms**: `form()` needs an injection context, so build the `FieldTree` with
  `TestBed.runInInjectionContext(() => form(model))`. A `FieldState` is that tree *called*:
  `fieldTree()`.
- **Required inputs** must be set via `fixture.componentRef.setInput(...)` **before** the first
  `detectChanges()`, with values real enough for the template.
- **Supplier pages** need `supplierRouteMock()` from `src/app/testing/supplier-route.mock.ts`;
  `provideRouter([])` alone is not deep enough (section 4).
- **Headless run**: `CHROME_BIN=$(node -e "Promise.resolve(require('puppeteer').executablePath()).then(p=>console.log(p))") npm run test:headless`
