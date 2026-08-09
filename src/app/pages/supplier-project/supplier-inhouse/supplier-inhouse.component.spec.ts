import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SupplierInhouseComponent } from './supplier-inhouse.component';

describe('SupplierInhouseComponent', () => {
  let component: SupplierInhouseComponent;
  let fixture: ComponentFixture<SupplierInhouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierInhouseComponent],
      providers: [{ provide: SupplierApiService, useFactory: () => new SupplierApiService('DN') }, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierInhouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
