import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepThreePageComponent } from './step-three-page.component';

describe('StepThreePageComponent', () => {
  let component: StepThreePageComponent;
  let fixture: ComponentFixture<StepThreePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepThreePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepThreePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
