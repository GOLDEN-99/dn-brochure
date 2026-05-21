import { TestBed } from '@angular/core/testing';

import { OtherIncomeIncomeService } from './other-income-income.service';

describe('OtherIncomeIncomeService', () => {
  let service: OtherIncomeIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
