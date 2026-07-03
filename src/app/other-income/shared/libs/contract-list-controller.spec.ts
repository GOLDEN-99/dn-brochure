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

  function create(fetch: () => Observable<TItem[]> = () => of(items)) {
    return TestBed.runInInjectionContext(() => new ContractListController<TItem>({ fetch }));
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

  it('defaults compType filter to DN and filters items by it', () => {
    const controller = create();
    expect(controller.compTypeFilter()).toBe('DN');
    expect(controller.filteredItems().every(i => i.compType === 'DN')).toBe(true);
  });

  it('filters by compCode, compName, and contractLabelId together', () => {
    setQuery({ compType: 'HU', compCode: 'C3', compName: 'Supplier 3', contractLabelId: '3' });
    const controller = create();
    expect(controller.filteredItems()).toEqual([items[2]]);
  });

  it('paginates the filtered result set', () => {
    setQuery({ compType: 'HU' });
    const controller = create();
    expect(controller.filteredItems().length).toBe(12);
    expect(controller.totalPages()).toBe(1);
    expect(controller.pagedItems().length).toBe(12);
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
