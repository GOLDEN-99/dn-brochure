import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeEventSelectComponent } from './other-income-event-select.component';

describe('OtherIncomeEventSelectComponent', () => {
  let component: OtherIncomeEventSelectComponent;
  let fixture: ComponentFixture<OtherIncomeEventSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeEventSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeEventSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
