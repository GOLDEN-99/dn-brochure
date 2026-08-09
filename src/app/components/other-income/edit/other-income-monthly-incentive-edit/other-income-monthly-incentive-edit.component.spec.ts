import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeMonthlyIncentiveEditComponent } from './other-income-monthly-incentive-edit.component';

describe('OtherIncomeMonthlyIncentiveEditComponent', () => {
  let component: OtherIncomeMonthlyIncentiveEditComponent;
  let fixture: ComponentFixture<OtherIncomeMonthlyIncentiveEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeMonthlyIncentiveEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeMonthlyIncentiveEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('incomeList', []);
    fixture.componentRef.setInput('eventType', 1);
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
