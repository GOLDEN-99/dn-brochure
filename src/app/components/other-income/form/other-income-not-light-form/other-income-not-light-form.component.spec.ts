import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeNotLightFormComponent } from './other-income-not-light-form.component';

describe('OtherIncomeNotLightFormComponent', () => {
  let component: OtherIncomeNotLightFormComponent;
  let fixture: ComponentFixture<OtherIncomeNotLightFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeNotLightFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeNotLightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
