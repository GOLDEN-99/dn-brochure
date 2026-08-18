# List page pattern: URL-driven filters + pagination

Shared implementation: `src/app/other-income/shared/libs/contract-list-controller.ts`
(`ContractListController<T>`). Used by `order-contract-list-page`,
`promo-contract-list-page`, and `branch-contract-list-page` — those three were
byte-for-byte identical aside from the fetch call and `eventType` filter, so
the filter/pagination logic was extracted rather than copy-pasted a fourth time.

For any list page with filters and/or pagination, the URL query string is the
single source of truth — not local mutable signals. This makes the view
shareable/bookmarkable and survives reloads/back-button navigation.

## Usage

```ts
export class OrderContractListPageComponent {
  private readonly api = inject(OtherIncomePurchaseApiService);
  private readonly eventService = inject(OtherIncomeEventService);

  readonly list = new ContractListController({
    fetch: () => this.api.getOrderContracts(),
  });

  contractLabelOptions = computed(() => this.eventService.event().filter((e) => e.eventType === "ORDER"));
}
```

`ContractListController` must be constructed in an injection context (a field
initializer, as above) since it calls `inject()` internally for `Router`,
`ActivatedRoute`, and `DestroyRef`. Templates access state/actions through the
`list` property (`list.pagedItems()`, `list.setSearchCompCode($event)`, etc).

## Shape (inside `ContractListController`)

```ts
private readonly queryParamMap = toSignal(this.route.queryParamMap, {
  initialValue: this.route.snapshot.queryParamMap,
});

// Every filter/page value is a *computed* derived from queryParamMap — never a plain signal.
compTypeFilter = computed<'DN' | 'HU'>(() =>
  this.queryParamMap().get('compType') === 'HU' ? 'HU' : 'DN'
);
currentPage = computed(() => Math.max(1, Number(this.queryParamMap().get('page')) || 1));

// Pagination over the already-filtered, client-fetched list:
pageSize = signal(20);
totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())));
pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
pagedItems = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize();
  return this.filteredItems().slice(start, start + this.pageSize());
});
```

All writes go through one helper that merges into the URL:

```ts
private setQueryParams(params: Record<string, string | number | null>, opts: { resetPage?: boolean } = {}): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: opts.resetPage ? { ...params, page: 1 } : params,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}
```

Each filter setter (`setSearchCompCode`, `setCompTypeFilter`, ...) calls
`setQueryParams({...}, { resetPage: true })` — changing a filter always resets
to page 1, since the filtered result set shifts. `goToPage` calls it without
`resetPage`.

Template inputs/selects bind with `[ngModel]="list.filter()"` /
`(ngModelChange)="list.setFilter($event)"` — never plain `[(ngModel)]` on a
signal (that syntax silently does not write back to a signal and was a bug
caught during this work).

## Why

- Filtering/pagination here is client-side over a fetched array (the backend
  list endpoints don't support page/filter params yet). If/when they do,
  the same query-param-as-source-of-truth shape extends naturally to passing
  those params straight into the API call instead of filtering in `computed()`.
- Keeping all filter/page state as `computed()` off one `queryParamMap` signal
  (rather than scattered local signals plus a sync effect) avoids feedback
  loops and keeps the URL ↔ state relationship one-directional and easy to
  reason about.
- The controller is a plain class (not a service or base class) so each page
  configures it per-instance (fetch call, page size) without DI provider
  boilerplate or fragile inheritance across Angular's component decorator.
