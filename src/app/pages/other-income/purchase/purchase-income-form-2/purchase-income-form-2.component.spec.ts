import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseIncomeForm2Component } from './purchase-income-form-2.component';

describe('PurchaseIncomeForm2Component', () => {
  let component: PurchaseIncomeForm2Component;
  let fixture: ComponentFixture<PurchaseIncomeForm2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseIncomeForm2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseIncomeForm2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
