import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochureFlashSalePageComponent } from './brochure-flash-sale-page.component';

describe('BrochureFlashSalePageComponent', () => {
  let component: BrochureFlashSalePageComponent;
  let fixture: ComponentFixture<BrochureFlashSalePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochureFlashSalePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochureFlashSalePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
