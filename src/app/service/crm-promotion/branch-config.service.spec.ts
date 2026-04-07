import { TestBed } from '@angular/core/testing';

import { BranchConfigService } from './branch-config.service';

describe('BranchConfigService', () => {
  let service: BranchConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BranchConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
