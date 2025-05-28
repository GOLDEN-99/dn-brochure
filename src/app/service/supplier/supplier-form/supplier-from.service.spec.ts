import { TestBed } from '@angular/core/testing';

import { SupplierFromService } from './supplier-from.service';

describe('SupplierFromService', () => {
  let service: SupplierFromService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierFromService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
