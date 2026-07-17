import { TestBed } from '@angular/core/testing';

import { CrmGroupService } from './crm-group.service';

describe('CrmGroupService', () => {
  let service: CrmGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
