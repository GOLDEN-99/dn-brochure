import { TestBed } from '@angular/core/testing';

import { OtherIncomeAccountPeriodService } from './other-income-account-period.service';

describe('OtherIncomeAccountPeriodService', () => {
  let service: OtherIncomeAccountPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeAccountPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
