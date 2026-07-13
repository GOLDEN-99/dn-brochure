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

  const settlement: TSettlementListItem = {
    id: 950, contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30',
    systemOrderAmount: null, cnOrderAmount: null, systemIncome: 1000, supplierOrderAmount: null, supplierIncome: 0,
    cumulativeOrderAtClose: null, remark: null, createdAt: '2026-07-01T00:00:00Z',
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('OtherIncomePurchaseApiService', [
      'getPromoContract', 'getIncomeEntries', 'getSettlements', 'postPromoSettlement', 'postPromoAccrual', 'deletePromoAccrual',
    ]);
    api.getPromoContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [PromoContractContextService, { provide: OtherIncomePurchaseApiService, useValue: api }],
    });
    service = TestBed.inject(PromoContractContextService);
  });

  /** Flushes the microtask queue and Angular's reactive graph so resource() loaders settle. */
  async function flush(): Promise<void> {
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
  }

  async function load(id: number): Promise<void> {
    service.setId(id);
    await flush();
  }

  it('loads contract, income entries, and settlements scoped to PROMO', async () => {
    await load(2);

    expect(service.contract()).toEqual(contract);
    expect(service.incomeEntries()).toEqual(entries);
    expect(api.getIncomeEntries).toHaveBeenCalledWith({ contractType: 'PROMO', contractId: 2 });
    expect(api.getSettlements).toHaveBeenCalledWith({ contractType: 'PROMO', contractId: 2 });
  });

  it('reloads income entries after deletePromoAccrual resolves', async () => {
    await load(2);
    api.getIncomeEntries.calls.reset();
    api.deletePromoAccrual.and.returnValue(of(undefined));

    service.deletePromoAccrual(200).subscribe();
    await flush();

    expect(api.deletePromoAccrual).toHaveBeenCalledWith(200);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
  });

  it('reloads settlements and income entries after addSettlement resolves', async () => {
    await load(2);
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.postPromoSettlement.and.returnValue(of(settlement));

    const req: TPostSettlementReq = {
      contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30', incomeEntryIds: [200],
    };
    service.addSettlement(req).subscribe();
    await flush();

    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
  });

  it('reloads contract, income entries, and settlements after addPromoAccrual resolves', async () => {
    await load(2);
    api.getPromoContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.postPromoAccrual.and.returnValue(of(entries[0]));

    service.addPromoAccrual(2, { month: '2026-03-01', amount: 500 }).subscribe();
    await flush();

    expect(api.getPromoContract).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getSettlements).toHaveBeenCalledTimes(1);
  });

  it('throws if addSettlement is called before a contract is loaded', () => {
    const req: TPostSettlementReq = {
      contractId: 2, contractType: 'PROMO', periodName: 'H1', startDate: '2026-01-01', endDate: '2026-06-30', incomeEntryIds: [],
    };
    expect(() => service.addSettlement(req)).toThrowError('Contract not loaded');
  });

  it('throws if deleteContract is called before a contract is loaded', () => {
    expect(() => service.deleteContract()).toThrowError('Contract not loaded');
  });
});
