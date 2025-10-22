import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { ibobAuthGuard } from './ibob-auth.guard';

describe('ibobAuthGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ibobAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
