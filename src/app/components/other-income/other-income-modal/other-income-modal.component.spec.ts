import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeModalComponent } from './other-income-modal.component';

describe('OtherIncomeModalComponent', () => {
  let component: OtherIncomeModalComponent;
  let fixture: ComponentFixture<OtherIncomeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
