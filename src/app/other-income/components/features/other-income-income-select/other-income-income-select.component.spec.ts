import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeIncomeSelectComponent } from './other-income-income-select.component';

describe('OtherIncomeIncomeSelectComponent', () => {
  let component: OtherIncomeIncomeSelectComponent;
  let fixture: ComponentFixture<OtherIncomeIncomeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeIncomeSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeIncomeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
