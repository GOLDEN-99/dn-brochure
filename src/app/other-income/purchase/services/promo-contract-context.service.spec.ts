import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PromoContractContextService } from './promo-contract-context.service';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TIncomeEntry, TPromoContractDetail, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';

describe('PromoContractContextService', () => {
  let service: PromoContractContextService;
  let api: jasmine.SpyObj<OtherIncomePurchaseApiService>;

  const contract: TPromoContractDetail = {
    id: 2,
    compCode: 'HU002',
    compName: 'HU Co',
    compType: 'HU',
    contractLabelId: 3,
    contractLabelName: 'Promo event',
    settlementPeriod: 6,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdAt: '2026-01-01T00:00:00Z',
    incomeTypes: [],
  };

  const entries: TIncomeEntry[] = [
    { id: 200, contractId: 2, contractType: 'PROMO', entryType: 'AUTO', month: '2026-01-01', orderAmount: null, amount: 1000, note: null, settlementId: null, createdAt: '2026-01-01T00:00:00Z' },
    { id: 201, contractId: 2, contractType: 'PROMO', entryType: 'AUTO', month: '2026-02-01', orderAmount: null, amount: 1000, note: null, settlementId: null, createdAt: '2026-02-01T00:00:00Z' },
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj('OtherIncomePurchaseApiService', [
      'getPromoContract', 'getIncomeEntries', 'getSettlements', 'postPromoSettlement', 'postPromoAccrual', 'deletePromoAccrual',
    ]);
    TestBed.configureTestingModule({
      providers: [PromoContractContextService, { provide: OtherIncomePurchaseApiService, useValue: api }],
    });
    service = TestBed.inject(PromoContractContextService);
  });

  it('loads contract, income entries, and settlements scoped to PROMO', () => {
    api.getPromoContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));

    service.load(2);

    expect(service.contract()).toEqual(contract);
    expect(service.incomeEntries()).toEqual(entries);
    expect(api.getIncomeEntries).toHaveBeenCalledWith({ contractType: 'PROMO', contractId: 2 });
    expect(api.getSettlements).toHaveBeenCalledWith({ contractType: 'PROMO', contractId: 2 });
  });

  it('removes an entry from state after deletePromoAccrual resolves', () => {
    api.getPromoContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));
    service.load(2);

    api.deletePromoAccrual.and.returnValue(of(undefined));
    service.deletePromoAccrual(200).subscribe();

    expect(service.incomeEntries().map(e => e.id)).toEqual([201]);
  });

  it('marks only the picked income entries as settled after addSettlement', () => {
    api.getPromoContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));
    service.load(2);

    const settlement: TSettlementListItem = {
      id: 950, contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30',
      systemOrderAmount: null, cnOrderAmount: null, systemIncome: 1000, supplierOrderAmount: null, supplierIncome: 0,
      cumulativeOrderAtClose: null, remark: null, createdAt: '2026-07-01T00:00:00Z',
    };
    api.postPromoSettlement.and.returnValue(of(settlement));

    const req: TPostSettlementReq = {
      contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30', incomeEntryIds: [200],
    };

    service.addSettlement(req).subscribe();

    const updated = service.incomeEntries();
    expect(updated.find(e => e.id === 200)?.settlementId).toBe(950);
    expect(updated.find(e => e.id === 201)?.settlementId).toBeNull();
  });

  it('throws if addSettlement is called before a contract is loaded', () => {
    const req: TPostSettlementReq = {
      contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30', incomeEntryIds: [],
    };
    expect(() => service.addSettlement(req)).toThrowError('Contract not loaded');
  });
});
