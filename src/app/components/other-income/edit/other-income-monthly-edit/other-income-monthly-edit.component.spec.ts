import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeMonthlyEditComponent } from './other-income-monthly-edit.component';

describe('OtherIncomeMonthlyEditComponent', () => {
  let component: OtherIncomeMonthlyEditComponent;
  let fixture: ComponentFixture<OtherIncomeMonthlyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeMonthlyEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeMonthlyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
