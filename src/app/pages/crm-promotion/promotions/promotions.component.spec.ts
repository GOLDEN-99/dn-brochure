import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { TPromotionDetail, TPromotionListDetail, TPromotionListItem } from '../../../types/crm-promotion.type';
import { PAGE_SIZE, PromotionsComponent } from './promotions.component';

const header = (id: number, over: Partial<TPromotionListItem> = {}): TPromotionListItem => ({
  id, promotionName: `promo ${String(id).padStart(3, '0')}`, promotionType: 'ITEM', source: 'HU', action: 'ITEMPRICE',
  thresholdType: 'ITEMEXIST', isRepeat: true, promotionStatus: 'ACTIVE',
  startdate: '2026-10-01', enddate: '2026-10-31', promotionPriority: 0, promotionOrder: 0,
  ...over,
});

const detailOf = (h: TPromotionListItem, over: Partial<TPromotionDetail> = {}): TPromotionDetail => ({
  ...h, promotionDesc: '', isBranchSpecific: false, isMemberSpecific: false,
  limitTime: false, startTime: '', endTime: '', activeDays: '1111111',
  tiers: [{ thresholdValue: 0, rewardValue: 89 }],
  filterList: [{ filterType: 'EXIST', filterValue: 1, productList: [{ goodCode: `G${h.id}`, goodName: 'Vida C', sku: `S${h.id}` }] }],
  rewardPool: [], branches: [], members: [],
  ...over,
});

const listDetailOf = (d: TPromotionDetail): TPromotionListDetail => {
  const { branches, ...rest } = d;
  return { ...rest, branchCount: branches.length };
};

const item = header(1, { promotionName: 'ราคาพิเศษ Vida' });
const spend = header(2, {
  promotionName: 'ครบ 500', promotionType: 'BUNDLE', thresholdType: 'BUNDLESUBTOTAL',
  action: 'BUNDLEBATHDISC', isRepeat: false, promotionStatus: 'INACTIVE',
});
const spendDetail = detailOf(spend, {
  tiers: [{ thresholdValue: 500, rewardValue: 50 }],
  isBranchSpecific: true,
  branches: [{ branchCode: '0001', branchName: 'A' }, { branchCode: '0002', branchName: 'B' }],
  filterList: [{ filterType: 'EXIST', filterValue: 1, productList: [
    { goodCode: '2001', goodName: 'Eucerin A', sku: 'E1' }, { goodCode: '2002', goodName: 'Eucerin B', sku: 'E2' },
  ] }],
});

describe('PromotionsComponent', () => {
  let fixture: ComponentFixture<PromotionsComponent>;
  let component: PromotionsComponent;
  let getPromotionById: jasmine.Spy;
  let getPromotionDetails: jasmine.Spy;
  const router = jasmine.createSpyObj('Router', ['navigate']);

  function create(headers: TPromotionListItem[], bulk: () => Observable<unknown>, byId: (id: number) => Observable<TPromotionDetail>) {
    getPromotionDetails = jasmine.createSpy('getPromotionDetails').and.callFake(bulk);
    getPromotionById = jasmine.createSpy('getPromotionById').and.callFake(byId);
    TestBed.configureTestingModule({
      imports: [PromotionsComponent],
      providers: [
        { provide: CrmPromotionService, useValue: { allPromotions: signal(headers), getPromotionDetails, getPromotionById } },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(PromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  describe('with include=details (bulk)', () => {
    beforeEach(() => create(
      [item, spend],
      () => of([listDetailOf(detailOf(item)), listDetailOf(spendDetail)]),
      () => throwError(() => new Error('should not be called')),
    ));

    it('loads every detail in one call and none per row', () => {
      expect(component.mode()).toBe('bulk');
      expect(getPromotionDetails).toHaveBeenCalledTimes(1);
      expect(getPromotionById).not.toHaveBeenCalled();
    });

    it('places rows in sections and words them through describePromotion', () => {
      const counts = Object.fromEntries(component.sections().map(s => [s.key, s.rows.length]));
      expect(counts).toEqual({ GOODS: 1, SPEND: 1, BILL: 0 });
      expect(component.rows().find(r => r.item.id === 1)!.description!.deal).toBe('Vida C ×1 → 89.-');
      expect(component.rows().find(r => r.item.id === 2)!.description!.deal).toBe('กลุ่มสินค้า 2 รายการ ครบ 500 → ลด 50.-');
    });

    it('shows branch scope from the count', () => {
      const d = component.rows().find(r => r.item.id === 2)!.detail!;
      expect(component.branchScope(d)).toBe('2 สาขา');
    });

    it('filters by status', () => {
      component.setStatus('INACTIVE');
      expect(component.rows().map(r => r.item.id)).toEqual([2]);
    });

    it('finds a promotion by a good it names, not only by its own name', () => {
      component.setQuery('eucerin b');
      expect(component.rows().map(r => r.item.id)).toEqual([2]);
      component.setQuery('E1');
      expect(component.rows().map(r => r.item.id)).toEqual([2]);
    });

    it('shows the active tab only', () => {
      expect(component.pagedRows().map(r => r.item.id)).toEqual([1]);
      component.selectSection('SPEND');
      expect(component.pagedRows().map(r => r.item.id)).toEqual([2]);
    });

    it('opens the detail page on row click', () => {
      component.onClickRow(2);
      expect(router.navigate).toHaveBeenCalledWith(['/crm-promotion', 2]);
    });
  });

  describe('against an API without include=details (per-row fallback)', () => {
    const many = Array.from({ length: PAGE_SIZE + 5 }, (_, i) => header(i + 10));
    const broken = many[1];

    beforeEach(() => create(
      many,
      () => of(many),   // the old API ignores include and answers with headers
      id => id === broken.id ? throwError(() => new Error('500')) : of(detailOf(header(id))),
    ));

    it('falls back when the bulk answer has no tiers', () => {
      expect(component.mode()).toBe('perRow');
    });

    it('fetches only the rows on the current page', () => {
      const asked = getPromotionById.calls.allArgs().map(a => a[0]);
      expect(asked.length).toBe(PAGE_SIZE);
      expect(asked).toEqual(component.pagedRows().map(r => r.item.id));
    });

    it('marks a failed row as failed, not loading', () => {
      expect(component.rows().find(r => r.item.id === broken.id)!.detail).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('โหลดรายละเอียดไม่ได้');
    });

    it('fetches the next page when it is opened, and never refetches a loaded row', () => {
      component.goToPage(1);
      TestBed.flushEffects();
      const asked = getPromotionById.calls.allArgs().map(a => a[0]);
      expect(asked.length).toBe(many.length);
      expect(new Set(asked).size).toBe(many.length);
    });
  });

  it('falls back when the bulk request itself fails', () => {
    create([item], () => throwError(() => new Error('429')), () => of(detailOf(item)));
    expect(component.mode()).toBe('perRow');
    expect(getPromotionById).toHaveBeenCalledWith(1);
  });

  it('pages a long tab and resets to the first page on a new search', () => {
    const many = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => header(i + 100));
    create(many, () => of(many.map(h => listDetailOf(detailOf(h)))), () => of(detailOf(item)));
    expect(component.pageCount()).toBe(2);
    component.goToPage(1);
    expect(component.pagedRows().length).toBe(1);
    component.setQuery('promo');
    expect(component.currentPage()).toBe(0);
  });
});
