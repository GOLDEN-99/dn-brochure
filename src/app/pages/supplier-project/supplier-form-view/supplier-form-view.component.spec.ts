import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { supplierRouteMock } from '../../../testing/supplier-route.mock';

import { SupplierFormViewComponent } from './supplier-form-view.component';

describe('SupplierFormViewComponent', () => {
  let component: SupplierFormViewComponent;
  let fixture: ComponentFixture<SupplierFormViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFormViewComponent],
      providers: [{ provide: SupplierApiService, useFactory: () => new SupplierApiService('DN') }, provideHttpClient(), provideHttpClientTesting(), { provide: ActivatedRoute, useValue: supplierRouteMock() }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierFormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
