import { TestBed } from '@angular/core/testing';

import { LibLoaderService } from './lib-loader.service';

describe('LibLoaderService', () => {
  let service: LibLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
