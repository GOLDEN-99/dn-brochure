import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseAppendOrderReportComponent } from './purchase-append-order-report.component';

describe('PurchaseAppendOrderReportComponent', () => {
  let component: PurchaseAppendOrderReportComponent;
  let fixture: ComponentFixture<PurchaseAppendOrderReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseAppendOrderReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseAppendOrderReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
