import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ContractListController } from './contract-list-controller';

type TItem = {
  id: number;
  compType: 'DN' | 'HU';
  compCode: string;
  compName: string | null;
  contractLabelId: number;
};

const items: TItem[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  compType: i % 2 === 0 ? 'DN' : 'HU',
  compCode: `C${i + 1}`,
  compName: `Supplier ${i + 1}`,
  contractLabelId: (i % 3) + 1,
}));

describe('ContractListController', () => {
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let router: jasmine.SpyObj<Router>;

  function setQuery(params: Record<string, string>): void {
    const map = convertToParamMap(params);
    queryParamMap$.next(map);
    (TestBed.inject(ActivatedRoute) as unknown as { snapshot: { queryParamMap: typeof map } }).snapshot.queryParamMap = map;
  }

  function create(
    fetch: (params: { compType?: string; startDate?: string; endDate?: string }) => Observable<TItem[]> = () => of(items),
    defaultDateRange?: () => { startDate: string; endDate: string }
  ) {
    return TestBed.runInInjectionContext(() => new ContractListController<TItem>({ fetch, defaultDateRange }));
  }

  beforeEach(() => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    });
  });

  it('loads items on construction', () => {
    const controller = create();
    expect(controller.loading()).toBe(false);
    expect(controller.items()).toEqual(items);
    expect(controller.error()).toBeNull();
  });

  it('surfaces a Thai error message when the fetch fails', () => {
    const controller = create(() => throwError(() => new Error('boom')));
    expect(controller.error()).toBe('โหลดข้อมูลไม่สำเร็จ');
    expect(controller.loading()).toBe(false);
  });

  it('defaults compType filter to DN and passes it to fetch', () => {
    const fetch = jasmine.createSpy('fetch').and.returnValue(of(items));
    const controller = create(fetch);
    expect(controller.compTypeFilter()).toBe('DN');
    expect(fetch).toHaveBeenCalledWith(jasmine.objectContaining({ compType: 'DN' }));
  });

  it('filters by compCode, compName, and contractLabelId together', () => {
    setQuery({ compCode: 'C3', compName: 'Supplier 3', contractLabelId: '3' });
    const controller = create();
    expect(controller.filteredItems()).toEqual([items[2]]);
  });

  it('paginates the filtered result set', () => {
    const controller = create();
    expect(controller.filteredItems().length).toBe(25);
    expect(controller.totalPages()).toBe(2);
    expect(controller.pagedItems().length).toBe(20);
  });

  it('setCompTypeFilter merges compType into the URL, resets to page 1, and reloads', () => {
    const fetch = jasmine.createSpy('fetch').and.returnValue(of(items));
    const controller = create(fetch);
    fetch.calls.reset();

    controller.setCompTypeFilter('HU');

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { compType: 'HU', page: 1 },
    }));
    expect(fetch).toHaveBeenCalledWith(jasmine.objectContaining({ compType: 'HU' }));
  });

  it('setSearchCompCode merges compCode into the URL and resets to page 1', () => {
    const controller = create();
    controller.setSearchCompCode(' C1 ');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { compCode: 'C1', page: 1 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
  });

  it('setSearchCompCode clears the param when given blank input', () => {
    const controller = create();
    controller.setSearchCompCode('   ');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { compCode: null, page: 1 },
    }));
  });

  it('passes startDate/endDate from the URL into the fetch call', () => {
    setQuery({ startDate: '2026-01-01', endDate: '2026-06-30' });
    const fetch = jasmine.createSpy('fetch').and.returnValue(of(items));
    create(fetch);
    expect(fetch).toHaveBeenCalledWith({ compType: 'DN', startDate: '2026-01-01', endDate: '2026-06-30' });
  });

  it('falls back to defaultDateRange when no startDate/endDate is in the URL', () => {
    const fetch = jasmine.createSpy('fetch').and.returnValue(of(items));
    const defaultDateRange = () => ({ startDate: '2026-01-01', endDate: '2026-12-31' });

    const controller = create(fetch, defaultDateRange);

    expect(controller.startDateFilter()).toBe('2026-01-01');
    expect(controller.endDateFilter()).toBe('2026-12-31');
    expect(fetch).toHaveBeenCalledWith({ compType: 'DN', startDate: '2026-01-01', endDate: '2026-12-31' });
  });

  it('URL startDate/endDate override defaultDateRange', () => {
    setQuery({ startDate: '2026-03-01' });
    const defaultDateRange = () => ({ startDate: '2026-01-01', endDate: '2026-12-31' });

    const controller = create(() => of(items), defaultDateRange);

    expect(controller.startDateFilter()).toBe('2026-03-01');
    expect(controller.endDateFilter()).toBe('2026-12-31');
  });

  it('setStartDateFilter merges startDate into the URL, resets to page 1, and reloads', () => {
    const fetch = jasmine.createSpy('fetch').and.returnValue(of(items));
    const controller = create(fetch);
    fetch.calls.reset();

    controller.setStartDateFilter('2026-02-01');

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { startDate: '2026-02-01', page: 1 },
    }));
    expect(fetch).toHaveBeenCalled();
  });

  it('setEndDateFilter clears the param when given blank input', () => {
    const controller = create();
    controller.setEndDateFilter('');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { endDate: null, page: 1 },
    }));
  });

  it('goToPage clamps to [1, totalPages] without resetting other params', () => {
    setQuery({ page: '1' });
    const controller = create();

    controller.goToPage(999);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { page: controller.totalPages() },
    }));

    controller.goToPage(-5);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { page: 1 },
    }));
  });
});
