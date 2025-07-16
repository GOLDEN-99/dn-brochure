import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightSingleComponent } from './light-single.component';

describe('LightSingleComponent', () => {
  let component: LightSingleComponent;
  let fixture: ComponentFixture<LightSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightSingleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
