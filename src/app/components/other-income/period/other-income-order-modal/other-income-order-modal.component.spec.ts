import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeOrderModalComponent } from './other-income-order-modal.component';

describe('OtherIncomeOrderModalComponent', () => {
  let component: OtherIncomeOrderModalComponent;
  let fixture: ComponentFixture<OtherIncomeOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
