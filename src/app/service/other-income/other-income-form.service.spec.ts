import { TestBed } from '@angular/core/testing';

import { OtherIncomeFormService } from './other-income-form.service';

describe('OtherIncomeFormService', () => {
  let service: OtherIncomeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
