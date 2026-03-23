import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMonthlyReportComponent } from './account-monthly-report.component';

describe('AccountMonthlyReportComponent', () => {
  let component: AccountMonthlyReportComponent;
  let fixture: ComponentFixture<AccountMonthlyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountMonthlyReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountMonthlyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
