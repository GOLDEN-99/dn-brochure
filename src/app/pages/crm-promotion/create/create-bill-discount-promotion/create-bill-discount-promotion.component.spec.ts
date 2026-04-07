import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillDiscountPromotionComponent } from './create-bill-discount-promotion.component';

describe('CreateBillDiscountPromotionComponent', () => {
  let component: CreateBillDiscountPromotionComponent;
  let fixture: ComponentFixture<CreateBillDiscountPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBillDiscountPromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBillDiscountPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
