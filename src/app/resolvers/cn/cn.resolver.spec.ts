import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { cnResolver } from './cn.resolver';

describe('cnResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => cnResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
