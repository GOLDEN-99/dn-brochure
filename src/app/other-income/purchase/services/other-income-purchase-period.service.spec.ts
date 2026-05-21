import { TestBed } from '@angular/core/testing';

import { OtherIncomePurchasePeriodService } from './other-income-purchase-period.service';

describe('OtherIncomePurchasePeriodService', () => {
  let service: OtherIncomePurchasePeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomePurchasePeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
