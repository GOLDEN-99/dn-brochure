import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DcRebateHomePageComponent } from './dc-rebate-home-page.component';

describe('DcRebateHomePageComponent', () => {
  let component: DcRebateHomePageComponent;
  let fixture: ComponentFixture<DcRebateHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DcRebateHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DcRebateHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
