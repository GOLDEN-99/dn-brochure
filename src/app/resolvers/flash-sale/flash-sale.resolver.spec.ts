import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { flashSaleResolver } from './flash-sale.resolver';

describe('flashSaleResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => flashSaleResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
