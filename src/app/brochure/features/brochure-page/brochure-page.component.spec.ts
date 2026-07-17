import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrochurePageComponent } from './brochure-page.component';

describe('BrochurePageComponent', () => {
  let component: BrochurePageComponent;
  let fixture: ComponentFixture<BrochurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrochurePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrochurePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
