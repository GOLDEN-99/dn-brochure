import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeCreateDcComponent } from './other-income-create-dc.component';

describe('OtherIncomeCreateDcComponent', () => {
  let component: OtherIncomeCreateDcComponent;
  let fixture: ComponentFixture<OtherIncomeCreateDcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeCreateDcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeCreateDcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
