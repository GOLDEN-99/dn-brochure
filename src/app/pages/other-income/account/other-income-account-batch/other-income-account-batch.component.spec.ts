import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeAccountBatchComponent } from './other-income-account-batch.component';

describe('OtherIncomeAccountBatchComponent', () => {
  let component: OtherIncomeAccountBatchComponent;
  let fixture: ComponentFixture<OtherIncomeAccountBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeAccountBatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeAccountBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
