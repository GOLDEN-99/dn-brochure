import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExportPdfService } from './export-pdf.service';

describe('ExportPdfService', () => {
  let service: ExportPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExportPdfService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ExportPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
