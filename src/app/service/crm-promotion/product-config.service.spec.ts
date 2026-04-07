import { TestBed } from '@angular/core/testing';

import { ProductConfigService } from './product-config.service';

describe('ProductConfigService', () => {
  let service: ProductConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
