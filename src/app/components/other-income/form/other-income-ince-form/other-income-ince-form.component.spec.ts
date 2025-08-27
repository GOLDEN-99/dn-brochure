import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeInceFormComponent } from './other-income-ince-form.component';

describe('OtherIncomeInceFormComponent', () => {
  let component: OtherIncomeInceFormComponent;
  let fixture: ComponentFixture<OtherIncomeInceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeInceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeInceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
