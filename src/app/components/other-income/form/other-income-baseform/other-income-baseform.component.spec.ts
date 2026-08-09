import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeBaseformComponent } from './other-income-baseform.component';

describe('OtherIncomeBaseformComponent', () => {
  let component: OtherIncomeBaseformComponent;
  let fixture: ComponentFixture<OtherIncomeBaseformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeBaseformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeBaseformComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('eventType', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
