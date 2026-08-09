import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeProductEditComponent } from './other-income-product-edit.component';

describe('OtherIncomeProductEditComponent', () => {
  let component: OtherIncomeProductEditComponent;
  let fixture: ComponentFixture<OtherIncomeProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeProductEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeProductEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productList', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
