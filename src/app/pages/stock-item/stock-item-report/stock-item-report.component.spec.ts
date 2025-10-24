import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockItemReportComponent } from './stock-item-report.component';

describe('StockItemReportComponent', () => {
  let component: StockItemReportComponent;
  let fixture: ComponentFixture<StockItemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockItemReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockItemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
