import { TestBed } from '@angular/core/testing';

import { OtherIncomeEventService } from './other-income-event.service';

describe('OtherIncomeEventService', () => {
  let service: OtherIncomeEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherIncomeEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
