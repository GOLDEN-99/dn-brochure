import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePromotionSetConfigComponent } from './create-promotion-set-config.component';

describe('CreatePromotionSetConfigComponent', () => {
  let component: CreatePromotionSetConfigComponent;
  let fixture: ComponentFixture<CreatePromotionSetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePromotionSetConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePromotionSetConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
