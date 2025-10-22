import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { ibobCompTypeChildGuardGuard } from './ibob-comp-type-child-guard.guard';

describe('ibobCompTypeChildGuardGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ibobCompTypeChildGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
