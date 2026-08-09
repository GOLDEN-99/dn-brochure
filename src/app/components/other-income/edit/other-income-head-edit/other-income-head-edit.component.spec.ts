import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeHeadEditComponent } from './other-income-head-edit.component';

describe('OtherIncomeHeadEditComponent', () => {
  let component: OtherIncomeHeadEditComponent;
  let fixture: ComponentFixture<OtherIncomeHeadEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeHeadEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeHeadEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headIncomeList', []);
    fixture.componentRef.setInput('head', { id: 1 });
    fixture.componentRef.setInput('comp', { compCode: 'C001', compName: 'Comp' });
    fixture.componentRef.setInput('event', { eventType: 1, eventName: 'E' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
