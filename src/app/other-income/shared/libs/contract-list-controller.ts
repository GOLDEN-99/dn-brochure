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
  fetch: (params: { compType?: string; startDate?: string; endDate?: string }) => Observable<T[]>;
  pageSize?: number;
  defaultDateRange?: () => { startDate: string; endDate: string };
};

/**
 * URL-driven filters + pagination shared by other-income contract list pages.
 * See src/app/other-income/purchase/components/pages/CLAUDE.md for the pattern this codifies.
 */
export class ContractListController<T extends TContractListItem> {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub$ = new Subject<void>();

  private readonly fetch: (params: { compType?: string; startDate?: string; endDate?: string }) => Observable<T[]>;
  private readonly pageSize;
  private readonly defaultDateRange?: () => { startDate: string; endDate: string };

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
  startDateFilter = computed(() =>
    this.queryParamMap().get('startDate') ?? this.defaultDateRange?.().startDate ?? ''
  );
  endDateFilter = computed(() =>
    this.queryParamMap().get('endDate') ?? this.defaultDateRange?.().endDate ?? ''
  );

  filteredItems = computed(() => {
    const compCode = this.searchCompCode().trim();
    const compName = this.searchCompName().trim().toLowerCase();
    const labelId = this.contractLabelFilter();
    return this.items().filter(item => {
      const matchCode = !compCode || item.compCode.includes(compCode);
      const matchName = !compName || (item.compName?.toLowerCase().includes(compName) ?? false);
      const matchLabel = !labelId || item.contractLabelId === labelId;
      return matchCode && matchName && matchLabel;
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
    this.defaultDateRange = options.defaultDateRange;

    inject(DestroyRef).onDestroy(() => {
      this.sub$.next();
      this.sub$.complete();
    });

    this.load();
  }

  load(params?: { compType?: string; startDate?: string; endDate?: string }): void {
    const compType = params?.compType ?? this.compTypeFilter();
    const startDate = params?.startDate ?? this.startDateFilter();
    const endDate = params?.endDate ?? this.endDateFilter();
    this.loading.set(true);
    this.error.set(null);
    this.fetch({
      compType: compType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
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
    this.load({ compType: value });
  }

  setContractLabelFilter(value: number | null): void {
    this.setQueryParams({ contractLabelId: value }, { resetPage: true });
  }

  setStartDateFilter(value: string): void {
    this.setQueryParams({ startDate: value || null }, { resetPage: true });
    this.load({ startDate: value });
  }

  setEndDateFilter(value: string): void {
    this.setQueryParams({ endDate: value || null }, { resetPage: true });
    this.load({ endDate: value });
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
