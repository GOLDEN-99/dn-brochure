import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExportExcelService } from './export-excel.service';

describe('ExportExcelService', () => {
  let service: ExportExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExportExcelService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ExportExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
