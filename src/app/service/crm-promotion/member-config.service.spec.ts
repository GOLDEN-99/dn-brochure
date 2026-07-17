import { TestBed } from '@angular/core/testing';

import { MemberConfigService } from './member-config.service';

describe('MemberConfigService', () => {
  let service: MemberConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
