import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IPDFJsFunctionality, IXLSXFunctionality } from '../types/index.type';

@Injectable({
  providedIn: 'root'
})
export class LibLoaderService {
  loadXlsx = (): Observable<IXLSXFunctionality> =>
    from(import('../libs/lazy-load-lib')
      .then((module) => module.loadXlsx()));

  loadPDF = (): Observable<IPDFJsFunctionality> =>
    from(import('../libs/lazy-load-lib')
      .then((module) => module.loadPDF()));
}
