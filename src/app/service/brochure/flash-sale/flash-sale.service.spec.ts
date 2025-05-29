import { TestBed } from '@angular/core/testing';

import { FlashSaleService } from './flash-sale.service';

describe('FlashSaleService', () => {
  let service: FlashSaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlashSaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
