import { TestBed } from '@angular/core/testing';

import { ProchureService } from './prochure.service';

describe('ProchureService', () => {
  let service: ProchureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProchureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
