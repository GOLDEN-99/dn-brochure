import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochureSpecialPageComponent } from './brochure-special-page.component';

describe('BrochureSpecialPageComponent', () => {
  let component: BrochureSpecialPageComponent;
  let fixture: ComponentFixture<BrochureSpecialPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochureSpecialPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochureSpecialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
