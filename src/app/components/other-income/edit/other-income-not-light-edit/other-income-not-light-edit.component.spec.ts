import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeNotLightEditComponent } from './other-income-not-light-edit.component';

describe('OtherIncomeNotLightEditComponent', () => {
  let component: OtherIncomeNotLightEditComponent;
  let fixture: ComponentFixture<OtherIncomeNotLightEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeNotLightEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeNotLightEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
