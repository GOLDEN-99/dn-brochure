import { TestBed } from '@angular/core/testing';

import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';

describe('OtherIncomePurchaseApiService', () => {
  let service: OtherIncomePurchaseApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomePurchaseApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
