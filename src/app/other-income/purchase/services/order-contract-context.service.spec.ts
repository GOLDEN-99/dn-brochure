import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderContractContextService } from './order-contract-context.service';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TIncomeEntry, TOrderContractDetail, TPairedIncomeEntries, TPostPairedSettlementReq, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';

describe('OrderContractContextService', () => {
  let service: OrderContractContextService;
  let api: jasmine.SpyObj<OtherIncomePurchaseApiService>;

  const contract: TOrderContractDetail = {
    id: 1,
    compCode: 'C001',
    compName: 'Test Comp',
    compType: 'DN',
    contractLabelId: 1,
    contractLabelName: 'Label',
    settlementPeriod: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdAt: '2026-01-01',
    supplierPairId: null,
    cumulativeOrderAmount: 0,
    calcType: 'Flat',
    currentBracket: null,
    spec: { id: 1, calcType: 'Flat', capAmount: null, excludeVat: false, excludeDc: false, excludeRebate: false, excludeInce: false, excludeComp: false },
    steps: [],
    products: [],
    incomeTypes: [],
  };

  const entries: TIncomeEntry[] = [
    { id: 100, contractId: 1, contractType: 'ORDER', entryType: 'AUTO', month: '2026-01-01', orderAmount: null, amount: 500, note: null, settlementId: null, createdAt: '2026-01-01T00:00:00Z' },
  ];

  const settlement: TSettlementListItem = {
    id: 900, contractId: 1, contractType: 'ORDER', periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31',
    systemOrderAmount: null, cnOrderAmount: null, systemIncome: 500, supplierOrderAmount: null, supplierIncome: 0,
    cumulativeOrderAtClose: null, remark: null, createdAt: '2026-04-01T00:00:00Z',
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('OtherIncomePurchaseApiService', [
      'getOrderContract', 'getIncomeEntries', 'getSettlements', 'getPairedIncomeEntries',
      'postCnCorrection', 'postLagCorrection', 'postManualCorrection', 'postOrderSettlement', 'postPairedSettlement',
      'deleteOrderContract',
    ]);
    api.getOrderContract.and.returnValue(of(contract));
    api.getIncomeEntries.and.returnValue(of(entries));
    api.getSettlements.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [OrderContractContextService, { provide: OtherIncomePurchaseApiService, useValue: api }],
    });
    service = TestBed.inject(OrderContractContextService);
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

  it('loads contract, income entries, and settlements in parallel when id is set', async () => {
    await load(1);

    expect(service.contract()).toEqual(contract);
    expect(service.incomeEntries()).toEqual(entries);
    expect(service.settlements()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(api.getIncomeEntries).toHaveBeenCalledWith({ contractType: 'ORDER', contractId: 1 });
    expect(api.getSettlements).toHaveBeenCalledWith({ contractType: 'ORDER', contractId: 1 });
  });

  it('does not fetch anything before an id is set', async () => {
    await flush();

    expect(api.getOrderContract).not.toHaveBeenCalled();
    expect(service.contract()).toBeNull();
  });

  it('does not fetch paired income entries when the contract has no supplierPairId', async () => {
    await load(1);

    expect(api.getPairedIncomeEntries).not.toHaveBeenCalled();
    expect(service.pairedEntries()).toBeNull();
  });

  it('fetches paired income entries once the contract resolves with a supplierPairId', async () => {
    const pairedContract = { ...contract, supplierPairId: 55 };
    const paired: TPairedIncomeEntries = { id: 1, dnContractId: 1, huContractId: 2, supplierPairId: 55, dnEntries: [], huEntries: [] };
    api.getOrderContract.and.returnValue(of(pairedContract));
    api.getPairedIncomeEntries.and.returnValue(of(paired));

    await load(1);

    expect(api.getPairedIncomeEntries).toHaveBeenCalledWith({ dnContractId: 1 });
    expect(service.pairedEntries()).toEqual(paired);
  });

  it('refresh() reloads contract, income entries, and settlements', async () => {
    await load(1);
    api.getOrderContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();

    service.refresh();
    await flush();

    expect(api.getOrderContract).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getSettlements).toHaveBeenCalledTimes(1);
  });

  it('incomeEntriesRefresh() reloads only income entries', async () => {
    await load(1);
    api.getOrderContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();

    service.incomeEntriesRefresh();
    await flush();

    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getOrderContract).not.toHaveBeenCalled();
    expect(api.getSettlements).not.toHaveBeenCalled();
  });

  it('settlementsRefresh() reloads only settlements', async () => {
    await load(1);
    api.getOrderContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();

    service.settlementsRefresh();
    await flush();

    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getOrderContract).not.toHaveBeenCalled();
    expect(api.getIncomeEntries).not.toHaveBeenCalled();
  });

  it('refreshChildren() reloads income entries and settlements but not the contract', async () => {
    await load(1);
    api.getOrderContract.calls.reset();
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();

    service.refreshChildren();
    await flush();

    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getOrderContract).not.toHaveBeenCalled();
  });

  it('addCnCorrection reloads income entries after the request resolves', async () => {
    await load(1);
    api.getIncomeEntries.calls.reset();
    api.postCnCorrection.and.returnValue(of(entries[0]));

    service.addCnCorrection(1, { contractId: 1, month: '2026-01-01', items: [] }).subscribe();
    await flush();

    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
  });

  it('addSettlement reloads both settlements and income entries after the request resolves', async () => {
    await load(1);
    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.postOrderSettlement.and.returnValue(of(settlement));

    const req: TPostSettlementReq = {
      contractId: 1, contractType: 'ORDER', periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31', incomeEntryIds: [100],
    };
    service.addSettlement(req).subscribe();
    await flush();

    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).toHaveBeenCalledTimes(1);
  });

  it('addPairedSettlement reloads settlements and paired entries, not the plain income entries', async () => {
    const pairedContract = { ...contract, supplierPairId: 55 };
    const paired: TPairedIncomeEntries = { id: 1, dnContractId: 1, huContractId: 2, supplierPairId: 55, dnEntries: [], huEntries: [] };
    api.getOrderContract.and.returnValue(of(pairedContract));
    api.getPairedIncomeEntries.and.returnValue(of(paired));
    await load(1);

    api.getIncomeEntries.calls.reset();
    api.getSettlements.calls.reset();
    api.getPairedIncomeEntries.calls.reset();
    api.postPairedSettlement.and.returnValue(of({ dnSettlement: settlement, huSettlement: settlement }));

    const req: TPostPairedSettlementReq = {
      dnContractId: 1, huContractId: 2, periodName: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31', dnIncomeEntryIds: [], huIncomeEntryIds: [],
    };
    service.addPairedSettlement(req).subscribe();
    await flush();

    expect(api.getSettlements).toHaveBeenCalledTimes(1);
    expect(api.getPairedIncomeEntries).toHaveBeenCalledTimes(1);
    expect(api.getIncomeEntries).not.toHaveBeenCalled();
  });

  it('throws if deleteContract is called before a contract is loaded', () => {
    expect(() => service.deleteContract()).toThrowError('Contract not loaded');
  });
});
