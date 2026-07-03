import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderContractCreatePageComponent } from './order-contract-create-page.component';

describe('OrderContractCreatePageComponent', () => {
  let component: OrderContractCreatePageComponent;
  let fixture: ComponentFixture<OrderContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderContractCreatePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderContractCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
