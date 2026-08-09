import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { supplierRouteMock } from '../../../testing/supplier-route.mock';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SupplierProductPageComponent } from './supplier-product-page.component';

describe('SupplierProductPageComponent', () => {
  let component: SupplierProductPageComponent;
  let fixture: ComponentFixture<SupplierProductPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierProductPageComponent],
      providers: [{ provide: SupplierApiService, useFactory: () => new SupplierApiService('DN') }, provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: ActivatedRoute, useValue: supplierRouteMock() }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
