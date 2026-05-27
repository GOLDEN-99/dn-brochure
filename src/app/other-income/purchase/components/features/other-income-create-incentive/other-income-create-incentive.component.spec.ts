import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeCreateIncentiveComponent } from './other-income-create-incentive.component';

describe('OtherIncomeCreateIncentiveComponent', () => {
  let component: OtherIncomeCreateIncentiveComponent;
  let fixture: ComponentFixture<OtherIncomeCreateIncentiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeCreateIncentiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeCreateIncentiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
