import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomePeriodAccountComponent } from './other-income-period-account.component';

describe('OtherIncomePeriodAccountComponent', () => {
  let component: OtherIncomePeriodAccountComponent;
  let fixture: ComponentFixture<OtherIncomePeriodAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomePeriodAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomePeriodAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
