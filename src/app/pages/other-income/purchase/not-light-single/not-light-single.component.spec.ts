import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotLightSingleComponent } from './not-light-single.component';

describe('NotLightSingleComponent', () => {
  let component: NotLightSingleComponent;
  let fixture: ComponentFixture<NotLightSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLightSingleComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLightSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
