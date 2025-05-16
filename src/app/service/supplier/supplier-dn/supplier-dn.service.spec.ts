import { TestBed } from '@angular/core/testing';

import { SupplierDnService } from './supplier-dn.service';

describe('SupplierDnService', () => {
  let service: SupplierDnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierDnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
