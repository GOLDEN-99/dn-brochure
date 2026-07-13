import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SettlementContextService } from './settlement-context.service';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TSettlementDetail } from '../../shared/types/other-income.type';

describe('SettlementContextService', () => {
  let service: SettlementContextService;
  let api: jasmine.SpyObj<OtherIncomePurchaseApiService>;

  const settlement: TSettlementDetail = {
    id: 900,
    contractId: 1,
    contractType: 'ORDER',
    periodName: 'Q1',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    systemOrderAmount: 100000,
    cnOrderAmount: null,
    systemIncome: 1000,
    supplierOrderAmount: 100000,
    supplierIncome: 1000,
    cumulativeOrderAtClose: null,
    remark: null,
    createdAt: '2026-04-01T00:00:00Z',
    billDiscounts: [],
    freeItems: [],
    invoices: [],
    receipts: [],
    creditNotes: [],
    matches: [],
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('OtherIncomePurchaseApiService', [
      'getSettlementDetail', 'postBillDiscounts', 'deleteBillDiscount', 'postFreeItems', 'deleteFreeItem',
    ]);
    TestBed.configureTestingModule({
      providers: [SettlementContextService, { provide: OtherIncomePurchaseApiService, useValue: api }],
    });
    service = TestBed.inject(SettlementContextService);
  });

  it('loads settlement detail', () => {
    api.getSettlementDetail.and.returnValue(of(settlement));

    service.load(900);

    expect(service.settlement()).toEqual(settlement);
    expect(service.loading()).toBe(false);
    expect(api.getSettlementDetail).toHaveBeenCalledWith(900);
  });

  it('sets an error and stops loading when getSettlementDetail fails', () => {
    api.getSettlementDetail.and.returnValue(throwError(() => new Error('network error')));

    service.load(900);

    expect(service.error()).toBe('โหลดข้อมูลไม่สำเร็จ');
    expect(service.loading()).toBe(false);
  });

  it('refreshes the settlement after addBillDiscounts resolves', () => {
    api.getSettlementDetail.and.returnValue(of(settlement));
    service.load(900);

    const req = { orderNumb: 'PO-1', receNumb: 'REC-1', subtotalAmount: 500, remark: '' };
    api.postBillDiscounts.and.returnValue(of({ ids: [10] }));
    const refreshed = { ...settlement, billDiscounts: [{ id: 10, ...req }] };
    api.getSettlementDetail.and.returnValue(of(refreshed));

    service.addBillDiscounts([req]).subscribe();

    expect(service.settlement()).toEqual(refreshed);
    expect(api.postBillDiscounts).toHaveBeenCalledWith(900, [req]);
    expect(api.getSettlementDetail).toHaveBeenCalledWith(900);
  });

  it('refreshes the settlement after removeBillDiscount resolves', () => {
    api.getSettlementDetail.and.returnValue(of({ ...settlement, billDiscounts: [{ id: 10, orderNumb: 'PO-1', receNumb: 'REC-1', subtotalAmount: 500, remark: '' }] }));
    service.load(900);
    api.deleteBillDiscount.and.returnValue(of(undefined));
    api.getSettlementDetail.and.returnValue(of(settlement));

    service.removeBillDiscount(10).subscribe();

    expect(service.settlement()?.billDiscounts).toEqual([]);
    expect(api.deleteBillDiscount).toHaveBeenCalledWith(900, 10);
  });

  it('refreshes the settlement after addFreeItems resolves', () => {
    api.getSettlementDetail.and.returnValue(of(settlement));
    service.load(900);

    const req = { orderNumb: 'PO-2', receNumb: 'REC-2', goodCode: 'G001', subtotalAmount: 200, remark: '' };
    api.postFreeItems.and.returnValue(of({ ids: [20] }));
    const refreshed = { ...settlement, freeItems: [{ id: 20, ...req }] };
    api.getSettlementDetail.and.returnValue(of(refreshed));

    service.addFreeItems([req]).subscribe();

    expect(service.settlement()).toEqual(refreshed);
    expect(api.postFreeItems).toHaveBeenCalledWith(900, [req]);
  });

  it('refreshes the settlement after removeFreeItem resolves', () => {
    api.getSettlementDetail.and.returnValue(of({ ...settlement, freeItems: [{ id: 20, orderNumb: 'PO-2', receNumb: 'REC-2', goodCode: 'G001', subtotalAmount: 200, remark: '' }] }));
    service.load(900);
    api.deleteFreeItem.and.returnValue(of(undefined));
    api.getSettlementDetail.and.returnValue(of(settlement));

    service.removeFreeItem(20).subscribe();

    expect(service.settlement()?.freeItems).toEqual([]);
    expect(api.deleteFreeItem).toHaveBeenCalledWith(900, 20);
  });

  it('throws if addBillDiscounts is called before a settlement is loaded', () => {
    expect(() => service.addBillDiscounts([{ orderNumb: '', receNumb: '', subtotalAmount: 0, remark: '' }])).toThrowError('Settlement not loaded');
  });

  it('throws if addFreeItems is called before a settlement is loaded', () => {
    expect(() => service.addFreeItems([{ orderNumb: '', receNumb: '', goodCode: '', subtotalAmount: 0, remark: '' }])).toThrowError('Settlement not loaded');
  });
});
