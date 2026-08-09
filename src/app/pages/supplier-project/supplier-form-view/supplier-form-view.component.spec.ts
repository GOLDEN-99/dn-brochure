import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SupplierFormViewComponent } from './supplier-form-view.component';

describe('SupplierFormViewComponent', () => {
  let component: SupplierFormViewComponent;
  let fixture: ComponentFixture<SupplierFormViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFormViewComponent],
      providers: [SupplierApiService, provideHttpClient(), provideHttpClientTesting()]
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
