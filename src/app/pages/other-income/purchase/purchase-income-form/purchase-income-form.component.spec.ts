import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseIncomeFormComponent } from './purchase-income-form.component';

describe('PurchaseIncomeFormComponent', () => {
  let component: PurchaseIncomeFormComponent;
  let fixture: ComponentFixture<PurchaseIncomeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseIncomeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseIncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
