import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { InlineItemDiscountComponent } from './inline-item-discount.component';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { TConfigGroup } from '../../../types/crm-promotion.type';

describe('InlineItemDiscountComponent', () => {
  let component: InlineItemDiscountComponent;
  let fixture: ComponentFixture<InlineItemDiscountComponent>;
  let getAllProductGroup: jasmine.Spy;
  let loading: jasmine.SpyObj<LoadingService>;
  let toast: jasmine.SpyObj<ToastService>;

  const selectGroup = (id: number) =>
    ({ item: { id } } as NgbTypeaheadSelectItemEvent<TConfigGroup>);

  beforeEach(async () => {
    getAllProductGroup = jasmine.createSpy('getAllProductGroup');
    loading = jasmine.createSpyObj('LoadingService', ['startLoad', 'endLoad']);
    toast = jasmine.createSpyObj('ToastService', ['success', 'danger']);

    await TestBed.configureTestingModule({
      imports: [InlineItemDiscountComponent],
      providers: [
        {
          provide: ProductConfigService,
          useValue: { allProduct: signal([]), allPromotionProductGroup: signal([]), getAllProductGroup },
        },
        { provide: LoadingService, useValue: loading },
        { provide: ToastService, useValue: toast },
      ],
    })
      .overrideComponent(InlineItemDiscountComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(InlineItemDiscountComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('benefitType', 'BATH');
    fixture.componentRef.setInput('inlinePool', []);
    fixture.detectChanges();
  });

  describe('onSelectpromoitionproductGroup', () => {
    it('ends loading when the request succeeds', () => {
      getAllProductGroup.and.returnValue(of({}));

      component.onSelectpromoitionproductGroup(selectGroup(3));

      expect(getAllProductGroup).toHaveBeenCalledWith(3);
      expect(toast.danger).not.toHaveBeenCalled();
      expect(loading.endLoad).toHaveBeenCalledTimes(1);
    });

    it('shows an error and still ends loading when the request fails', () => {
      getAllProductGroup.and.returnValue(throwError(() => new Error('500')));

      component.onSelectpromoitionproductGroup(selectGroup(3));

      expect(loading.startLoad).toHaveBeenCalledTimes(1);
      expect(toast.danger).toHaveBeenCalled();
      expect(loading.endLoad).toHaveBeenCalledTimes(1);
    });
  });
});
