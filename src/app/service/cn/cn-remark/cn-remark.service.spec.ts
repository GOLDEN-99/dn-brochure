import { TestBed } from '@angular/core/testing';

import { CnRemarkService } from './cn-remark.service';

describe('CnRemarkService', () => {
  let service: CnRemarkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnRemarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
