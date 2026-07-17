import { TestBed } from '@angular/core/testing';

import { BrochureApiService } from './brochure-api.service';

describe('BrochureApiService', () => {
  let service: BrochureApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrochureApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
