import { TestBed } from '@angular/core/testing';

import { OtherIncomeSearchProductService } from './other-income-search-product.service';

describe('OtherIncomeSearchProductService', () => {
  let service: OtherIncomeSearchProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeSearchProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
