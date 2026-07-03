import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeAccountHomeLayoutComponent } from './other-income-account-home-layout.component';

describe('OtherIncomeAccountHomeLayoutComponent', () => {
  let component: OtherIncomeAccountHomeLayoutComponent;
  let fixture: ComponentFixture<OtherIncomeAccountHomeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeAccountHomeLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeAccountHomeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
