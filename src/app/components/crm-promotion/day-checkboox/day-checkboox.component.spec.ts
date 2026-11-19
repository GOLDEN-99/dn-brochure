import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { DayCheckbooxComponent } from './day-checkboox.component';

describe('DayCheckbooxComponent', () => {
  let component: DayCheckbooxComponent;
  let fixture: ComponentFixture<DayCheckbooxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCheckbooxComponent, FormsModule],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DayCheckbooxComponent);
    component = fixture.componentInstance;
    component.activeDay.set([false, false, false, false, false, false, false]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: method tests

  it('should allow everyday on toggleEveryDay', () => {
    component.toggleEveryDay(true);
    expect(component.activeDay()).toEqual([true, true, true, true, true, true, true]);
  });

  it('should toggle individual day on toggleDayByDay', () => {
    component.toggleDayByDay(true, 2);
    expect(component.activeDay()).toEqual([false, false, true, false, false, false, false]);
  });
});
