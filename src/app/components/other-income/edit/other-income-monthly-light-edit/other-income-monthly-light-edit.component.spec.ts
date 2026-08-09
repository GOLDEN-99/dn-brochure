import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeMonthlyLightEditComponent } from './other-income-monthly-light-edit.component';

describe('OtherIncomeMonthlyLightEditComponent', () => {
  let component: OtherIncomeMonthlyLightEditComponent;
  let fixture: ComponentFixture<OtherIncomeMonthlyLightEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeMonthlyLightEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeMonthlyLightEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('incomeList', []);
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
