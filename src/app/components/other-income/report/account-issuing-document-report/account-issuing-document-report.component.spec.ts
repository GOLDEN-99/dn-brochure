import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountIssuingDocumentReportComponent } from './account-issuing-document-report.component';

describe('AccountIssuingDocumentReportComponent', () => {
  let component: AccountIssuingDocumentReportComponent;
  let fixture: ComponentFixture<AccountIssuingDocumentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountIssuingDocumentReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountIssuingDocumentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
