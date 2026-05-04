import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionMasterComponent } from './promotion-master.component';

describe('PromotionMasterComponent', () => {
  let component: PromotionMasterComponent;
  let fixture: ComponentFixture<PromotionMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
