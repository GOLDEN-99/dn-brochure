import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BranchContractSpecsPageComponent } from './branch-contract-specs-page.component';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AddBranchFormComponent } from '../../add-branch-form/add-branch-form.component';
import { TAddBranchReq, TBranchContractDetail } from '../../../types/other-income.type';

@Component({
  selector: 'other-income-add-branch-form',
  template: '',
})
class StubAddBranchFormComponent {
  contractId = input.required<number>()
  submitting = input(false)
  submitAddBranch = output<TAddBranchReq>()
  reset = jasmine.createSpy('reset')
}

function makeContract(overrides: Partial<TBranchContractDetail> = {}): TBranchContractDetail {
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
    spec: { id: 1, maxBranches: 10, ratePerBranch: 100 },
    branches: [],
    incomeTypes: [],
    ...overrides,
  }
}

describe('BranchContractSpecsPageComponent', () => {
  let component: BranchContractSpecsPageComponent;
  let fixture: ComponentFixture<BranchContractSpecsPageComponent>;
  let ctx: jasmine.SpyObj<BranchContractContextService>;
  let toast: jasmine.SpyObj<ToastService>;

  function setContract(value: TBranchContractDetail | null): void {
    (ctx as { contract: unknown }).contract = () => value;
  }

  beforeEach(async () => {
    ctx = jasmine.createSpyObj<BranchContractContextService>(
      'BranchContractContextService',
      ['addBranch'],
    );
    setContract(null);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'danger']);

    await TestBed.configureTestingModule({
      imports: [BranchContractSpecsPageComponent],
      providers: [
        { provide: BranchContractContextService, useValue: ctx },
        { provide: ToastService, useValue: toast },
      ],
    })
      .overrideComponent(BranchContractSpecsPageComponent, {
        remove: { imports: [AddBranchFormComponent] },
        add: { imports: [StubAddBranchFormComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BranchContractSpecsPageComponent);
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

  // Income types moved to BranchContractLayoutComponent in 85694e4, so this page renders
  // the branches table only — one empty-state row, not two.
  it('renders an empty-state row when branches are empty', () => {
    setContract(makeContract());
    fixture.detectChanges();

    const emptyRows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('td.text-center.text-muted'));
    expect(emptyRows.length).toBe(1);
    expect(emptyRows.some(row => row.textContent?.includes('ไม่มีข้อมูล'))).toBeTrue();
  });

  it('renders a row per branch when data is present', () => {
    setContract(makeContract({
      branches: [
        { id: 1, branchCode: 'B1', branchName: 'Branch 1', openDate: '2026-01-01', closeDate: null, createdAt: '2026-01-01' },
        { id: 2, branchCode: 'B2', branchName: null, openDate: '2026-02-01', closeDate: '2026-06-01', createdAt: '2026-02-01' },
      ],
      incomeTypes: [
        {
          id: 1,
          contractId: 1,
          contractType: 'BRANCH',
          incomeType: 'Bill',
          incomeLabelId: 1,
          incomeLabelName: 'Auto Income',
          createdAt: '2026-01-01',
        },
      ],
    }));
    fixture.detectChanges();

    const branchRows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(branchRows.length).toBe(2); // 2 branch rows; income types render in the layout
    expect(fixture.nativeElement.textContent).toContain('B1');
    expect(fixture.nativeElement.textContent).toContain('B2');
    expect(fixture.nativeElement.textContent).toContain('เปิดอยู่'); // open branch badge
  });

  describe('onSubmitAddBranch', () => {
    const req: TAddBranchReq = { branchCode: 'B1', openDate: '2026-01-01' };

    it('does nothing when no contract is loaded', () => {
      setContract(null);
      fixture.detectChanges();

      component.onSubmitAddBranch(req);

      expect(ctx.addBranch).not.toHaveBeenCalled();
    });

    it('adds the branch, resets the form, and toasts success', () => {
      setContract(makeContract());
      ctx.addBranch.and.returnValue(of({ entryId: 1, accruals_posted: 1 }));
      fixture.detectChanges();

      component.onSubmitAddBranch(req);

      expect(ctx.addBranch).toHaveBeenCalledWith(1, req);
      expect(toast.success).toHaveBeenCalledWith('เพิ่มสาขาเรียบร้อย');
      expect(component.submittingAddBranch()).toBeFalse();
    });

    it('toasts the server error message on failure', () => {
      setContract(makeContract());
      ctx.addBranch.and.returnValue(throwError(() => ({ error: { error: 'ผิดพลาด' } })));
      fixture.detectChanges();

      component.onSubmitAddBranch(req);

      expect(toast.danger).toHaveBeenCalledWith('ผิดพลาด');
      expect(component.submittingAddBranch()).toBeFalse();
    });

    it('falls back to a generic error message when the server gives none', () => {
      setContract(makeContract());
      ctx.addBranch.and.returnValue(throwError(() => ({})));
      fixture.detectChanges();

      component.onSubmitAddBranch(req);

      expect(toast.danger).toHaveBeenCalledWith('เกิดข้อผิดพลาด');
    });
  });
});
