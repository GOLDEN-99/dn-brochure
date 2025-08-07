import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeOrderReportComponent } from './other-income-order-report.component';

describe('OtherIncomeOrderReportComponent', () => {
  let component: OtherIncomeOrderReportComponent;
  let fixture: ComponentFixture<OtherIncomeOrderReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeOrderReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeOrderReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
