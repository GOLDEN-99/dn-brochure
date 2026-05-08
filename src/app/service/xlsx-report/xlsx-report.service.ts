import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import type * as XLSXType from 'xlsx'
import { IXLSXFunctionality, LibLoaderService } from '../lib-loader/lib-loader.service';

const xlsxPromise = import('xlsx')

@Injectable({
  providedIn: 'root'
})
export class XLSXReportService {

  private readonly libLoader = inject(LibLoaderService)
  private readonly xlsx = this.libLoader.xlsx

  exportExcel(driver: IXLSXFunctionality) {
    return function (filename: string) {
      return function (wb: XLSXType.WorkBook) {
        return new Observable<void>(observer => {
          try {
            driver.writeFile(wb, filename + '.xlsx');
            observer.next();
          } catch (err) {
            observer.error(err);
          } finally {
            observer.complete();
          }
        })
      }
    }
  }

  exportWorkbook(filename: string) {
    return function (wb: XLSXType.WorkBook) {
      return from(xlsxPromise).pipe(
        switchMap(XLSX => new Observable<void>(observer => {
          try {
            XLSX.writeFile(wb, filename + '.xlsx');
            observer.next();
          } catch (err) {
            observer.error(err);
          } finally {
            observer.complete();
          }
        }))
      );
    }
  }

  convertJsonToWorkbook<T extends TObject>({ sheetName, config }: TAoaConfig<T>) {
    const headers = config.map(c => c.header)
    const column = config.map(c => c.valueMapper)
    return function (data: T[]) {
      return from(xlsxPromise).pipe(
        switchMap(XLSX => {
          const wb = XLSX.utils.book_new()
          const aoa = [headers, ...data.map(d => column.map(fn => fn(d)))]
          const ws = XLSX.utils.aoa_to_sheet(aoa)
          XLSX.utils.book_append_sheet(wb, ws, sheetName)
          return [wb]
        })
      )
    }
  }

  convertTwoSheetWorkbook<A extends TObject, B extends TObject>(configA: TAoaConfig<A>, configB: TAoaConfig<B>) {
    return function (dataA: A[], dataB: B[]) {
      return from(xlsxPromise).pipe(
        switchMap(XLSX => {
          const wb = XLSX.utils.book_new()
          const headersA = configA.config.map(c => c.header)
          const colsA = configA.config.map(c => c.valueMapper)
          const wsA = XLSX.utils.aoa_to_sheet([headersA, ...dataA.map(d => colsA.map(fn => fn(d)))])
          XLSX.utils.book_append_sheet(wb, wsA, configA.sheetName)
          const headersB = configB.config.map(c => c.header)
          const colsB = configB.config.map(c => c.valueMapper)
          const wsB = XLSX.utils.aoa_to_sheet([headersB, ...dataB.map(d => colsB.map(fn => fn(d)))])
          XLSX.utils.book_append_sheet(wb, wsB, configB.sheetName)
          return [wb]
        })
      )
    }
  }

}


type TObject = Record<string, unknown>


export type TAoaConfig<T extends TObject> = {
  sheetName: string
  config: Array<{
    header: string
    valueMapper: (row: T) => unknown
  }>
}
