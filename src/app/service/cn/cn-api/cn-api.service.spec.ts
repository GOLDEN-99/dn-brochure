import { TestBed } from '@angular/core/testing';

import { CnApiService } from './cn-api.service';

describe('CnApiService', () => {
  let service: CnApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
