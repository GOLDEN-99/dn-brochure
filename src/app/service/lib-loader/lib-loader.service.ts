import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type * as XLSXType from 'xlsx'

export interface IXLSXFunctionality {
  writeFile(data: XLSXType.WorkBook, filename: string, opts?: XLSXType.WritingOptions): any;
  utils: XLSXType.XLSX$Utils
}

@Injectable({
  providedIn: 'root'
})
export class LibLoaderService {

  constructor() { }

  xlsx = new Observable<IXLSXFunctionality>(
    o => {
      import('xlsx')
        .then(xlsx => o.next(xlsx))
        .catch(err => o.error(err))
    })
}
