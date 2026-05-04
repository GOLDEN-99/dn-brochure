import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionDatetimeComponent } from './promotion-datetime.component';

describe('PromotionDatetimeComponent', () => {
  let component: PromotionDatetimeComponent;
  let fixture: ComponentFixture<PromotionDatetimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionDatetimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
