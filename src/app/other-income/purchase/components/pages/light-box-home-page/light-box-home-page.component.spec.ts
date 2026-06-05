import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightBoxHomePageComponent } from './light-box-home-page.component';

describe('LightBoxHomePageComponent', () => {
  let component: LightBoxHomePageComponent;
  let fixture: ComponentFixture<LightBoxHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightBoxHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightBoxHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
