import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineBenefitComponent } from './inline-benefit.component';

describe('InlineBenefitComponent', () => {
  let component: InlineBenefitComponent;
  let fixture: ComponentFixture<InlineBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineBenefitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
