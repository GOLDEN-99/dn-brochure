import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OtherIncomeSearchProductService } from '../../../services/other-income-search-product.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderContractCreatePageComponent } from './order-contract-create-page.component';

describe('OrderContractCreatePageComponent', () => {
  let component: OrderContractCreatePageComponent;
  let fixture: ComponentFixture<OrderContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderContractCreatePageComponent],
      providers: [OtherIncomeSearchProductService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
