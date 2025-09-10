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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
