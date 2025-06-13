import { TestBed } from '@angular/core/testing';

import { OtherIncomeSpecFormService } from './other-income-spec-form.service';

describe('OtherIncomeSpecFormService', () => {
  let service: OtherIncomeSpecFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeSpecFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
