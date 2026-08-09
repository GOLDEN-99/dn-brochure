import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProchureCardComponent } from './prochure-card.component';

describe('ProchureCardComponent', () => {
  let component: ProchureCardComponent;
  let fixture: ComponentFixture<ProchureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProchureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProchureCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('priceType', 'price');
    fixture.componentRef.setInput('color', 'green');
    fixture.componentRef.setInput('props', { isFlag: false, ...{ goodCode: 'G1', goodName: 'Good 1', barCode: '1234567890', price: { price: 10, priceGold: 9, priceSilver: 9, priceStandard: 10, quotaAmou: null, quotaUnit: null, isSpecial: false } } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
