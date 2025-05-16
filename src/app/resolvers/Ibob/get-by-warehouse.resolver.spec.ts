import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { getByWarehouseResolver } from './get-by-warehouse.resolver';

describe('getByWarehouseResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => getByWarehouseResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
