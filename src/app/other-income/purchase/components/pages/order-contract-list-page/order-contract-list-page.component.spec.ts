import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderContractListPageComponent } from './order-contract-list-page.component';

describe('OrderContractListPageComponent', () => {
  let component: OrderContractListPageComponent;
  let fixture: ComponentFixture<OrderContractListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderContractListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderContractListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
