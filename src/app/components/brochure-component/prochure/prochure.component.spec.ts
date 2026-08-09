import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProchureComponent } from './prochure.component';

describe('ProchureComponent', () => {
  let component: ProchureComponent;
  let fixture: ComponentFixture<ProchureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProchureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProchureComponent);
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
