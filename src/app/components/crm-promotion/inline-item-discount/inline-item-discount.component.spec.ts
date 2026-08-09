import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineItemDiscountComponent } from './inline-item-discount.component';

describe('InlineItemDiscountComponent', () => {
  let component: InlineItemDiscountComponent;
  let fixture: ComponentFixture<InlineItemDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineItemDiscountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineItemDiscountComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('benefitType', 'bath');
    fixture.componentRef.setInput('inlinePool', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
