import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayCheckbooxComponent } from './day-checkboox.component';

describe('DayCheckbooxComponent', () => {
  let component: DayCheckbooxComponent;
  let fixture: ComponentFixture<DayCheckbooxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCheckbooxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayCheckbooxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
