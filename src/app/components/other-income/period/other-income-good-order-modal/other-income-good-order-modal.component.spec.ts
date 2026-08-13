import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeGoodOrderModalComponent } from './other-income-good-order-modal.component';

describe('OtherIncomeGoodOrderModalComponent', () => {
  let component: OtherIncomeGoodOrderModalComponent;
  let fixture: ComponentFixture<OtherIncomeGoodOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeGoodOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeGoodOrderModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('compType', 'DN');
    fixture.componentRef.setInput('compCode', 'C001');
    fixture.componentRef.setInput('periodId', 1);
    fixture.componentRef.setInput('periodAmount', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
