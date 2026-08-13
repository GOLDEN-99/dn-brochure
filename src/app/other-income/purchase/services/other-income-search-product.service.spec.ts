import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OtherIncomeSearchProductService } from './other-income-search-product.service';

describe('OtherIncomeSearchProductService', () => {
  let service: OtherIncomeSearchProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OtherIncomeSearchProductService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OtherIncomeSearchProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
