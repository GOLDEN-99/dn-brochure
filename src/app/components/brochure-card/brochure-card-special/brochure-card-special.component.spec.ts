import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochureCardSpecialComponent } from './brochure-card-special.component';

describe('BrochureCardSpecialComponent', () => {
  let component: BrochureCardSpecialComponent;
  let fixture: ComponentFixture<BrochureCardSpecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochureCardSpecialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochureCardSpecialComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('color', 'green');
    fixture.componentRef.setInput('props', { isFlag: false, ...{ goodCode: 'G1', goodName: 'Good 1', barCode: '1234567890', price: { price: 10, priceGold: 9, priceSilver: 9, priceStandard: 10, quotaAmou: null, quotaUnit: null, isSpecial: false } } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
