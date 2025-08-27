import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeGoodOrderModalComponent } from './other-income-good-order-modal.component';

describe('OtherIncomeGoodOrderModalComponent', () => {
  let component: OtherIncomeGoodOrderModalComponent;
  let fixture: ComponentFixture<OtherIncomeGoodOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeGoodOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeGoodOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
