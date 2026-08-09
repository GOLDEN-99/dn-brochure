import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarCellComponent } from './calendar-cell.component';

describe('CalendarCellComponent', () => {
  let component: CalendarCellComponent;
  let fixture: ComponentFixture<CalendarCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarCellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('date', { day: 1, month: 1, year: 2026 });
    fixture.componentRef.setInput('month', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
