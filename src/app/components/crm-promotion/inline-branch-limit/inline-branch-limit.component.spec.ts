import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { InlineBranchLimitComponent } from './inline-branch-limit.component';
import { BranchConfigService } from '../../../service/crm-promotion/branch-config.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { TConfigGroup } from '../../../types/crm-promotion.type';

describe('InlineBranchLimitComponent', () => {
  let component: InlineBranchLimitComponent;
  let fixture: ComponentFixture<InlineBranchLimitComponent>;
  let getByGroupId: jasmine.Spy;
  let loading: jasmine.SpyObj<LoadingService>;
  let toast: jasmine.SpyObj<ToastService>;

  const selectGroup = (id: number) =>
    ({ item: { id } } as NgbTypeaheadSelectItemEvent<TConfigGroup>);

  beforeEach(async () => {
    getByGroupId = jasmine.createSpy('getByGroupId');
    loading = jasmine.createSpyObj('LoadingService', ['startLoad', 'endLoad']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'danger']);

    await TestBed.configureTestingModule({
      imports: [InlineBranchLimitComponent],
      providers: [
        {
          provide: BranchConfigService,
          useValue: { allBranches: signal([]), allBranchGroup: signal([]), getByGroupId },
        },
        { provide: LoadingService, useValue: loading },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineBranchLimitComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('branchLimit', true);
    fixture.componentRef.setInput('currentBranch', [{ branchCode: 'B1', branchName: 'one' }]);
    fixture.detectChanges();
  });

  describe('onSelcetPromotionBranchGroup', () => {
    it('adds only branches not already selected and ends loading on success', () => {
      getByGroupId.and.returnValue(of([
        { branchCode: 'B1', branchName: 'one' },
        { branchCode: 'B2', branchName: 'two' },
      ]));

      component.onSelcetPromotionBranchGroup(selectGroup(7));

      expect(getByGroupId).toHaveBeenCalledWith(7);
      expect(component.currentBranch().map(b => b.branchCode)).toEqual(['B1', 'B2']);
      expect(loading.endLoad).toHaveBeenCalledTimes(1);
    });

    it('shows an error and still ends loading when the request fails', () => {
      getByGroupId.and.returnValue(throwError(() => new Error('500')));

      component.onSelcetPromotionBranchGroup(selectGroup(7));

      expect(loading.startLoad).toHaveBeenCalledTimes(1);
      expect(toast.danger).toHaveBeenCalled();
      expect(component.currentBranch().map(b => b.branchCode)).toEqual(['B1']);
      expect(loading.endLoad).toHaveBeenCalledTimes(1);
    });
  });
});
