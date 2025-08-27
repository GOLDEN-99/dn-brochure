import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountSelectComponent } from './discount-select.component';

describe('DiscountSelectComponent', () => {
  let component: DiscountSelectComponent;
  let fixture: ComponentFixture<DiscountSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
