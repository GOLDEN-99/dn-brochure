import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { supplierRouteMock } from '../../../testing/supplier-route.mock';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ConditionPageComponent } from './condition-page.component';

describe('ConditionPageComponent', () => {
  let component: ConditionPageComponent;
  let fixture: ComponentFixture<ConditionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionPageComponent],
      providers: [{ provide: SupplierApiService, useFactory: () => new SupplierApiService('DN') }, provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: ActivatedRoute, useValue: supplierRouteMock() }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
