import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochurePageComponent } from './brochure-page.component';

describe('BrochurePageComponent', () => {
  let component: BrochurePageComponent;
  let fixture: ComponentFixture<BrochurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochurePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochurePageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('itemList', []);
    fixture.componentRef.setInput('size', 12);
    fixture.componentRef.setInput('head', { wholeName: 'W', promotionType: 'P', fromDate: '2026-01-01', toDate: '2026-12-31' });
    fixture.componentRef.setInput('priceType', 'price');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
