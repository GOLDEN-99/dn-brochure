import { TestBed } from '@angular/core/testing';

import { CrmPromotionService } from './crm-promotion.service';

describe('CrmPromotionService', () => {
  let service: CrmPromotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmPromotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
