import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx'


@Injectable({
  providedIn: 'root'
})
export class XLSXReportService {

  exportWorkbook(filename: string) {
    return function (wb: XLSX.WorkBook) {
      return new Observable<void>(observer => {
        try {
          XLSX.writeFile(wb, filename + '.xlsx');
          observer.next();
        } catch (err) {
          observer.error(err);
        } finally {
          observer.complete();
        }
      });
    }
  }

  convertJsonToWorkbook<T extends TObject>({ sheetName, config }: TAoaConfig<T>) {
    const headers = config.map(c => c.header)
    const column = config.map(c => c.valueMapper)
    return function (data: T[]) {
      const wb = XLSX.utils.book_new()
      const aoa = [headers, ...data.map(d => column.map(fn => fn(d)))]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      return wb
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
