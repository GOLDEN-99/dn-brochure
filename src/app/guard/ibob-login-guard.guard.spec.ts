import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ibobLoginGuardGuard } from './ibob-login-guard.guard';

describe('ibobLoginGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ibobLoginGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
