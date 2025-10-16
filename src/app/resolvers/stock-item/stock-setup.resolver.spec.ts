import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { stockSetupResolver } from './stock-setup.resolver';

describe('stockSetupResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => stockSetupResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
