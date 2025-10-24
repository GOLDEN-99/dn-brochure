import { TestBed } from '@angular/core/testing';

import { StockItemApiService } from './stock-item-api.service';

describe('StockItemApiService', () => {
  let service: StockItemApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockItemApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
