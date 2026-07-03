import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, takeUntil } from 'rxjs';

type TContractListItem = {
  compType: string;
  compCode: string;
  compName?: string | null;
  contractLabelId: number;
};

export type TContractListControllerOptions<T extends TContractListItem> = {
  fetch: () => Observable<T[]>;
  pageSize?: number;
};

/**
 * URL-driven filters + pagination shared by other-income contract list pages.
 * See src/app/other-income/purchase/components/pages/CLAUDE.md for the pattern this codifies.
 */
export class ContractListController<T extends TContractListItem> {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub$ = new Subject<void>();

  private readonly fetch: () => Observable<T[]>;
  private readonly pageSize;

  items = signal<T[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  compTypeFilter = computed<'DN' | 'HU'>(() =>
    this.queryParamMap().get('compType') === 'HU' ? 'HU' : 'DN'
  );
  searchCompCode = computed(() => this.queryParamMap().get('compCode') ?? '');
  searchCompName = computed(() => this.queryParamMap().get('compName') ?? '');
  contractLabelFilter = computed<number | null>(() => {
    const raw = this.queryParamMap().get('contractLabelId');
    return raw ? Number(raw) : null;
  });
  currentPage = computed(() => Math.max(1, Number(this.queryParamMap().get('page')) || 1));

  filteredItems = computed(() => {
    const compCode = this.searchCompCode().trim();
    const compName = this.searchCompName().trim().toLowerCase();
    const type = this.compTypeFilter();
    const labelId = this.contractLabelFilter();
    return this.items().filter(item => {
      const matchType = !type || item.compType === type;
      const matchCode = !compCode || item.compCode.includes(compCode);
      const matchName = !compName || (item.compName?.toLowerCase().includes(compName) ?? false);
      const matchLabel = !labelId || item.contractLabelId === labelId;
      return matchType && matchCode && matchName && matchLabel;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())));

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  pagedItems = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredItems().slice(start, start + size);
  });

  constructor(options: TContractListControllerOptions<T>) {
    this.fetch = options.fetch;
    this.pageSize = signal(options.pageSize ?? 20);

    inject(DestroyRef).onDestroy(() => {
      this.sub$.next();
      this.sub$.complete();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.fetch()
      .pipe(takeUntil(this.sub$))
      .subscribe({
        next: data => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('โหลดข้อมูลไม่สำเร็จ');
          this.loading.set(false);
        }
      });
  }

  setSearchCompCode(value: string): void {
    this.setQueryParams({ compCode: value.trim() || null }, { resetPage: true });
  }

  setSearchCompName(value: string): void {
    this.setQueryParams({ compName: value.trim() || null }, { resetPage: true });
  }

  setCompTypeFilter(value: 'DN' | 'HU'): void {
    this.setQueryParams({ compType: value }, { resetPage: true });
  }

  setContractLabelFilter(value: number | null): void {
    this.setQueryParams({ contractLabelId: value }, { resetPage: true });
  }

  goToPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages());
    this.setQueryParams({ page: clamped });
  }

  private setQueryParams(params: Record<string, string | number | null>, opts: { resetPage?: boolean } = {}): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: opts.resetPage ? { ...params, page: 1 } : params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
