import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountSubformComponent } from './discount-subform.component';

describe('DiscountSubformComponent', () => {
  let component: DiscountSubformComponent;
  let fixture: ComponentFixture<DiscountSubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountSubformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
