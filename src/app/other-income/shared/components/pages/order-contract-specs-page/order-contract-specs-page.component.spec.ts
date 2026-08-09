import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderContractSpecsPageComponent } from './order-contract-specs-page.component';
import { OrderContractContextService } from '../../../../purchase/services/order-contract-context.service';
import { TOrderContractDetail } from '../../../types/other-income.type';

function makeContract(overrides: Partial<TOrderContractDetail> = {}): TOrderContractDetail {
  return {
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
    spec: {
      id: 1,
      calcType: 'Flat',
      capAmount: null,
      excludeVat: false,
      excludeDc: false,
      excludeRebate: false,
      excludeInce: false,
      excludeComp: false,
    },
    steps: [],
    products: [],
    incomeTypes: [],
    ...overrides,
  }
}

describe('OrderContractSpecsPageComponent', () => {
  let component: OrderContractSpecsPageComponent;
  let fixture: ComponentFixture<OrderContractSpecsPageComponent>;
  let ctx: { contract: () => TOrderContractDetail | null };

  function setContract(value: TOrderContractDetail | null): void {
    ctx.contract = () => value;
  }

  beforeEach(async () => {
    ctx = { contract: () => null };

    await TestBed.configureTestingModule({
      imports: [OrderContractSpecsPageComponent],
      providers: [
        { provide: OrderContractContextService, useValue: ctx },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderContractSpecsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders nothing when there is no contract loaded', () => {
    setContract(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card')).toBeNull();
  });

  // Income types moved to OrderContractLayoutComponent in 85694e4, so this page has two
  // empty states left (steps and products), not three.
  it('renders empty-state rows when steps and products are empty', () => {
    setContract(makeContract());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect((text.match(/ไม่มีข้อมูล/g) ?? []).length).toBe(2);
  });

  it('renders steps and products when data is present', () => {
    setContract(makeContract({
      steps: [{ id: 1, min: 0, max: 1000, rate: 5 }],
      products: [{ goodCode: 'G1', goodName: 'Good 1', barCode: '1234567890' }],
      incomeTypes: [
        {
          id: 1,
          contractId: 1,
          contractType: 'ORDER',
          incomeType: 'Bill',
          incomeLabelId: 1,
          incomeLabelName: 'Auto Income',
          createdAt: '2026-01-01',
        },
      ],
    }));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('1234567890');
    expect(text).toContain('Good 1');
    expect(text).not.toContain('Auto Income'); // income types render in the layout, not here
  });
});
