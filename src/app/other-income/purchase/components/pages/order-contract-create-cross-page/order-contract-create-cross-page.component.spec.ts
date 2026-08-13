import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrderContractCreateCrossPageComponent } from './order-contract-create-cross-page.component';

describe('OrderContractCreateCrossPageComponent', () => {
  let component: OrderContractCreateCrossPageComponent;
  let fixture: ComponentFixture<OrderContractCreateCrossPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderContractCreateCrossPageComponent],
      providers: [provideRouter([])]
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
