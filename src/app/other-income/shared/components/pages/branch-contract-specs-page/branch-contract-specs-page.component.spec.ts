import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BranchContractSpecsPageComponent } from './branch-contract-specs-page.component';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AddBranchFormComponent } from '../../add-branch-form/add-branch-form.component';
import { TAddBranchReq, TBranchContractDetail } from '../../../types/other-income.type';

@Component({
  selector: 'other-income-add-branch-form',
  changeDetection: ChangeDetectionStrategy.Eager,
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
