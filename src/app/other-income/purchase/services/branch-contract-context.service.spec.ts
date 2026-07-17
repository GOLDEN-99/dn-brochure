import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BranchContractContextService } from './branch-contract-context.service';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TBranchContractDetail, TIncomeEntry, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';

describe('BranchContractContextService', () => {
  let service: BranchContractContextService;
  let api: jasmine.SpyObj<OtherIncomePurchaseApiService>;

  const contract: TBranchContractDetail = {
    id: 1,
    compCode: 'DN001',
    compName: 'DN Co',
    compType: 'DN',
    contractLabelId: 1,
    contractLabelName: 'Display fee',
    settlementPeriod: 3,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdAt: '2026-01-01T00:00:00Z',
    spec: { id: 1, maxBranches: 10, ratePerBranch: 100 },
    branches: [],
    incomeTypes: [],
  };

  const entries: TIncomeEntry[] = [
    { id: 100, contractId: 1, contractType: 'BRANCH', entryType: 'AUTO', month: '2026-01-01', orderAmount: null, amount: 500, note: null, settlementId: null, createdAt: '2026-01-01T00:00:00Z' },
    { id: 101, contractId: 1, contractType: 'BRANCH', entryType: 'AUTO', month: '2026-02-01', orderAmount: null, amount: 500, note: null, settlementId: null, createdAt: '2026-02-01T00:00:00Z' },
  ];

  const settlement: TSettlementListItem = {
    id: 900, contractId: 1, contractType: 'BRANCH', periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31',
    systemOrderAmount: null, cnOrderAmount: null, systemIncome: 500, supplierOrderAmount: null, supplierIncome: 0,
    cumulativeOrderAtClose: null, remark: null, createdAt: '2026-04-01T00:00:00Z',
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('OtherIncomePurchaseApiService', [
      'getBranchContract', 'getIncomeEntries', 'getSettlements', 'postBranchSettlement', 'addBranch', 'closeBranch',
    ]);
    api.getBranchContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [BranchContractContextService, { provide: OtherIncomePurchaseApiService, useValue: api }],
    });
    service = TestBed.inject(BranchContractContextService);
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

  it('loads contract, income entries, and settlements in parallel', async () => {
    await load(1);

    expect(service.contract()).toEqual(contract);
    expect(service.incomeEntries()).toEqual(entries);
    expect(service.loading()).toBe(false);
    expect(api.getIncomeEntries).toHaveBeenCalledWith({ contractType: 'BRANCH', contractId: 1 });
    expect(api.getSettlements).toHaveBeenCalledWith({ contractType: 'BRANCH', contractId: 1 });
  });

  it('reloads settlements and income entries after addSettlement resolves', async () => {
    await load(1);
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.postBranchSettlement.and.returnValue(of(settlement));

    const req: TPostSettlementReq = {
      contractId: 1, contractType: 'BRANCH', periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31', incomeEntryIds: [100],
    };
    service.addSettlement(req).subscribe();
    await flush();

    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
  });

  it('throws if addSettlement is called before a contract is loaded', () => {
    const req: TPostSettlementReq = {
      contractId: 1, contractType: 'BRANCH', periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31', incomeEntryIds: [],
    };
    expect(() => service.addSettlement(req)).toThrowError('Contract not loaded');
  });

  it('refreshes contract, income entries, and settlements after addBranch resolves', async () => {
    await load(1);
    api.getBranchContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.addBranch.and.returnValue(of({ entryId: 5, accruals_posted: 1 }));

    service.addBranch(1, { branchCode: 'B01', openDate: '2026-01-15' }).subscribe();
    await flush();

    expect(api.getBranchContract).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getSettlements).toHaveBeenCalledTimes(1);
  });

  it('throws if deleteContract is called before a contract is loaded', () => {
    expect(() => service.deleteContract()).toThrowError('Contract not loaded');
  });
});
