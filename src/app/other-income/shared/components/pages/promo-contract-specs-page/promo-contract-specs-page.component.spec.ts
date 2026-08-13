import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoContractSpecsPageComponent } from './promo-contract-specs-page.component';
import { PromoContractContextService } from '../../../../purchase/services/promo-contract-context.service';
import { TPromoContractDetail } from '../../../types/other-income.type';

function makeContract(overrides: Partial<TPromoContractDetail> = {}): TPromoContractDetail {
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
    incomeTypes: [],
    ...overrides,
  }
}

describe('PromoContractSpecsPageComponent', () => {
  let component: PromoContractSpecsPageComponent;
  let fixture: ComponentFixture<PromoContractSpecsPageComponent>;
  let ctx: { contract: () => TPromoContractDetail | null };

  function setContract(value: TPromoContractDetail | null): void {
    ctx.contract = () => value;
  }

  beforeEach(async () => {
    ctx = { contract: () => null };

    await TestBed.configureTestingModule({
      imports: [PromoContractSpecsPageComponent],
      providers: [
        { provide: PromoContractContextService, useValue: ctx },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoContractSpecsPageComponent);
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

  // The income-types table this page used to render moved to PromoContractLayoutComponent
  // in 85694e4 ("change purchasing layout to contain incomTypes at layout not spec tab").
  // The promo contract has no promo-specific terms of its own, so this tab is intentionally
  // blank; the assertions that used to live here belong to the layout's spec.
  it('renders no promo-specific terms even when a contract is loaded', () => {
    setContract(makeContract({
      incomeTypes: [
        {
          id: 1,
          contractId: 1,
          contractType: 'PROMO',
          incomeType: 'Bill',
          incomeLabelId: 1,
          incomeLabelName: 'Auto Income',
          createdAt: '2026-01-01',
        },
      ],
    }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });
});
