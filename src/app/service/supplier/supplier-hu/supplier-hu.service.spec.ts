import { TestBed } from '@angular/core/testing';

import { SupplierHuService } from './supplier-hu.service';

describe('SupplierHuService', () => {
  let service: SupplierHuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierHuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
