import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInvoicePageComponent } from './account-invoice-page.component';

describe('AccountInvoicePageComponent', () => {
  let component: AccountInvoicePageComponent;
  let fixture: ComponentFixture<AccountInvoicePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountInvoicePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountInvoicePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
