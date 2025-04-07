import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cnGuardGuard } from './cn-guard.guard';

describe('cnGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => cnGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
