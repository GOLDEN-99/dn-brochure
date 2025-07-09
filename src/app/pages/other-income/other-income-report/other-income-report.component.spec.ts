import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeReportComponent } from './other-income-report.component';

describe('OtherIncomeReportComponent', () => {
  let component: OtherIncomeReportComponent;
  let fixture: ComponentFixture<OtherIncomeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
