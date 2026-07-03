import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderContractCreateCrossPageComponent } from './order-contract-create-cross-page.component';

describe('OrderContractCreateCrossPageComponent', () => {
  let component: OrderContractCreateCrossPageComponent;
  let fixture: ComponentFixture<OrderContractCreateCrossPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderContractCreateCrossPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderContractCreateCrossPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
