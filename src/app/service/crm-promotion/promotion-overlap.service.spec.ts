import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PromotionOverlapService } from './promotion-overlap.service';
import { environment } from '../../../environments/environment';
import {
  TCreatePromotionRequest,
  TPromotionDetail,
  TPromotionListDetail,
  TPromotionListItem,
} from '../../types/crm-promotion.type';
import { OverlapReport } from '../../lib/crm-promotion/promotion-overlap';

const LIST = `${environment.oi}/crm/promotions`;

function request(over: Partial<TCreatePromotionRequest> = {}): TCreatePromotionRequest {
  return {
    promotionName: 'new', promotionDesc: '', promotionType: 'BUNDLE', source: 'SUPPLIER',
    promotionOrder: 0, promotionPriority: 0,
    startDate: '2026-10-01', endDate: '2026-10-31',
    isBranchSpecific: false, branches: [], isMemberSpecific: false, members: [],
    limitTime: false, startTime: '00:00:00', endTime: '00:00:00', activeDay: '1111111',
    filterList: [{ filterType: 'COUNT', filterValue: 2, productList: ['A'], products: [{ goodCode: 'A', unitCode: 'U1' }] }],
    action: 'BUNDLEPRICE', thresholdType: 'BUNDLECOUNT', isRepeat: true,
    tiers: [{ thresholdValue: 1, rewardValue: 150 }], rewardPool: [],
    ...over,
  };
}

function detail(over: Partial<TPromotionDetail> = {}): TPromotionDetail {
  return {
    id: 10, promotionName: 'live', promotionDesc: '', promotionType: 'BUNDLE', source: 'SUPPLIER',
    action: 'BUNDLEBATHDISC', thresholdType: 'BUNDLECOUNT', isRepeat: true,
    isBranchSpecific: false, isMemberSpecific: false,
    startdate: '2026-10-15T00:00:00', enddate: '2026-11-15T00:00:00',
    limitTime: false, startTime: '', endTime: '', activeDays: '1111111',
    promotionStatus: 'ACTIVE', promotionPriority: 0, promotionOrder: 0,
    tiers: [{ thresholdValue: 1, rewardValue: 50 }],
    filterList: [{ filterType: 'COUNT', filterValue: 3, productList: [{ goodCode: 'A', goodName: 'A', sku: 'A', unitCode: 'U1' }] }],
    rewardPool: [], branches: [], members: [],
    ...over,
  };
}

const listDetail = (over: Partial<TPromotionDetail> = {}): TPromotionListDetail => {
  const { branches, ...rest } = detail(over);
  return { ...rest, branchCount: branches.length };
};

const header = (over: Partial<TPromotionDetail> = {}): TPromotionListItem => {
  const d = detail(over);
  return {
    id: d.id, promotionName: d.promotionName, promotionType: d.promotionType, source: d.source,
    action: d.action, thresholdType: d.thresholdType, isRepeat: d.isRepeat,
    promotionStatus: d.promotionStatus, startdate: d.startdate, enddate: d.enddate,
    promotionPriority: d.promotionPriority, promotionOrder: d.promotionOrder,
  };
};

describe('PromotionOverlapService', () => {
  let service: PromotionOverlapService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(PromotionOverlapService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function run(req: TCreatePromotionRequest, editingId?: number): { report: () => OverlapReport } {
    let result: OverlapReport | undefined;
    service.check(req, editingId).subscribe((r) => (result = r));
    return {
      report: () => {
        if (!result) throw new Error('check did not complete');
        return result;
      },
    };
  }

  const expectList = () =>
    http.expectOne((r) => r.url === LIST && r.params.get('include') === 'details');

  it('asks nothing for a promotion the check does not cover', () => {
    const { report } = run(request({ promotionType: 'BILL', action: 'BILLBATHDISC', thresholdType: 'BILLSUBTOTAL' }));
    http.expectNone(() => true);
    expect(report()).toEqual({ overlaps: [], blocking: false });
  });

  it('narrows the list to live promotions of the type being saved', () => {
    run(request());
    const list = expectList();
    expect(list.request.params.get('promotionType')).toBe('BUNDLE');
    expect(list.request.params.get('status')).toBe('ACTIVE');
    list.flush([]);
  });

  it('settles a candidate from the list alone when no branch list is needed', () => {
    const { report } = run(request());
    expectList().flush([listDetail({ id: 10 }), listDetail({ id: 11, filterList: [] })]);
    http.expectNone((r) => r.url !== LIST);
    expect(report().overlaps.map((o) => o.existing.id)).toEqual([10]);
  });

  // The list reduces branches to a count; only a both-sides-specific pair needs the real list
  it('fetches the detail only when both sides are branch-specific', () => {
    const { report } = run(request({ isBranchSpecific: true, branches: ['B01'] }));
    expectList().flush([listDetail({ id: 10, isBranchSpecific: true }), listDetail({ id: 11 })]);
    http.expectOne(`${LIST}/10`).flush(detail({ id: 10, isBranchSpecific: true, branches: [{ branchCode: 'B02', branchName: '' }] }));
    http.expectNone(`${LIST}/11`);
    // B01 vs B02: no branch in common, so only the unscoped one remains
    expect(report().overlaps.map((o) => o.existing.id)).toEqual([11]);
  });

  it('does not fetch a branch list for a candidate that shares no product', () => {
    run(request({ isBranchSpecific: true, branches: ['B01'] }));
    expectList().flush([listDetail({ id: 10, isBranchSpecific: true, filterList: [] })]);
    http.expectNone(`${LIST}/10`);
  });

  // An API without include=details answers with headers; the header screen still applies
  it('falls back to GET /:id for every header candidate', () => {
    const { report } = run(request());
    expectList().flush([
      header({ id: 10 }),
      header({ id: 12, promotionStatus: 'INACTIVE' }),
      header({ id: 13, startdate: '2026-12-01T00:00:00', enddate: '2026-12-31T00:00:00' }),
    ]);
    http.expectOne(`${LIST}/10`).flush(detail({ id: 10 }));
    http.expectNone(`${LIST}/12`);
    http.expectNone(`${LIST}/13`);
    expect(report().overlaps.map((o) => o.existing.id)).toEqual([10]);
  });

  it('leaves the promotion being edited out', () => {
    const { report } = run(request(), 10);
    expectList().flush([listDetail({ id: 10 })]);
    expect(report().overlaps).toEqual([]);
  });
});
