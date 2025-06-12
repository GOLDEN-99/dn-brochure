import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotRowComponent } from './timeslot-row.component';

describe('TimeslotRowComponent', () => {
  let component: TimeslotRowComponent;
  let fixture: ComponentFixture<TimeslotRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeslotRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeslotRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
