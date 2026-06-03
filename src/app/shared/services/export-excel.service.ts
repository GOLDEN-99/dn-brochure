import { inject, Injectable } from '@angular/core';
import { LibLoaderService } from './lib-loader.service';

@Injectable()
export class ExportExcelService {
  private readonly libLoader = inject(LibLoaderService)
  private readonly xlsxLib$ = this.libLoader.loadXlsx()
}
