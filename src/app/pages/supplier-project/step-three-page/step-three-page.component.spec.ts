import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { supplierRouteMock } from '../../../testing/supplier-route.mock';
import { SupplierApiService } from '../../../service/supplier/supplier-api.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StepThreePageComponent } from './step-three-page.component';

describe('StepThreePageComponent', () => {
  let component: StepThreePageComponent;
  let fixture: ComponentFixture<StepThreePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepThreePageComponent],
      providers: [{ provide: SupplierApiService, useFactory: () => new SupplierApiService('DN') }, provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: ActivatedRoute, useValue: supplierRouteMock() }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepThreePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
