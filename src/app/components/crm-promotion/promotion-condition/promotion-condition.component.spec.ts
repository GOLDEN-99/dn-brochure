import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionConditionComponent } from './promotion-condition.component';

describe('PromotionConditionComponent', () => {
  let component: PromotionConditionComponent;
  let fixture: ComponentFixture<PromotionConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionConditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
