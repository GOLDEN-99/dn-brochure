import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashSaleCardComponent } from './flash-sale-card.component';

describe('FlashSaleCardComponent', () => {
  let component: FlashSaleCardComponent;
  let fixture: ComponentFixture<FlashSaleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashSaleCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashSaleCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cardProp', { goodCode: 'G1', goodName: 'Good 1', barCode: '1234567890', price: 10, salePrice: 9, discount: 10, unit: 'ea' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
