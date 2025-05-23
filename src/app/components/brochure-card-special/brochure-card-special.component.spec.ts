import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochureCardSpecialComponent } from './brochure-card-special.component';

describe('BrochureCardSpecialComponent', () => {
  let component: BrochureCardSpecialComponent;
  let fixture: ComponentFixture<BrochureCardSpecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochureCardSpecialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochureCardSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
