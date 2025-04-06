import { TestBed } from '@angular/core/testing';

import { CnOrderService } from './cn-order.service';

describe('CnOrderService', () => {
  let service: CnOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
