import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeNotLightEditComponent } from './other-income-not-light-edit.component';

describe('OtherIncomeNotLightEditComponent', () => {
  let component: OtherIncomeNotLightEditComponent;
  let fixture: ComponentFixture<OtherIncomeNotLightEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeNotLightEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeNotLightEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('notLight', { id: 1, calAmount: 0, actualAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', cn: 0, reason: '', checkDate: null, incomeAmount: 0 });
    fixture.componentRef.setInput('steps', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
