import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { marketingResolver } from './marketing.resolver';

describe('marketingResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => marketingResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
