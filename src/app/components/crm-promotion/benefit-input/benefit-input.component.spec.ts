import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitInputComponent } from './benefit-input.component';

describe('BenefitInputComponent', () => {
  let component: BenefitInputComponent;
  let fixture: ComponentFixture<BenefitInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenefitInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BenefitInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
