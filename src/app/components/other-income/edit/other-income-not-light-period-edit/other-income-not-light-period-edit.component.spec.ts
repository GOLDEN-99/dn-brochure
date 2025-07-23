import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeNotLightPeriodEditComponent } from './other-income-not-light-period-edit.component';

describe('OtherIncomeNotLightPeriodEditComponent', () => {
  let component: OtherIncomeNotLightPeriodEditComponent;
  let fixture: ComponentFixture<OtherIncomeNotLightPeriodEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeNotLightPeriodEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeNotLightPeriodEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
