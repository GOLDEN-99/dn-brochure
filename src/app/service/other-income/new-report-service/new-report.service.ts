import { inject, Injectable } from '@angular/core';
import { TCompType } from '../../../types';
import { ApiService } from '../../api/api.service';
import { environment } from '../../../../environments/environment';
import { XLSXReportService } from '../../xlsx-report/xlsx-report.service';
import { catchError, map, switchMap, throwError } from 'rxjs';
import { DCMonthConfig, IncentiveMonthConfig, LightBoxMonthConfig, TMonthlyReportResponse } from './monthly-report-config';


@Injectable({
  providedIn: 'root'
})
export class NewReportService {

  constructor() { }

  private readonly api = inject(ApiService)
  private readonly baseUrl = environment.oi + '/report/account/v2'

  private readonly xlsx = inject(XLSXReportService)


  private getMonthReport(req: TMonthlyReportReq) {
    const params: Record<string, TValidParamValue> = this.praseQuerParams(req)
    return this.api.get<TMonthlyReportResponse[]>(`${this.baseUrl}/monthly`, { params })
  }
  getDcRebateReport(req: Pick<TMonthlyReportReq, "month" | "compType">) {
    const mapper = this.xlsx.convertJsonToWorkbook<TMonthlyReportResponse>(DCMonthConfig)
    const exporter = this.xlsx.exportWorkbook(`ประมาณการ dc rebate ${req.month}`)
    return this.getMonthReport({ ...req, eventType: 1 })
      .pipe(
        map(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getLightBoxReport(req: Pick<TMonthlyReportReq, "month" | "compType">) {
    const mapper = this.xlsx.convertJsonToWorkbook<TMonthlyReportResponse>(LightBoxMonthConfig)
    const exporter = this.xlsx.exportWorkbook(`ประมาณการ light box ${req.month}`)
    return this.getMonthReport({ ...req, eventType: 2 })
      .pipe(
        map(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getInceMonthReport(req: Pick<TMonthlyReportReq, "month" | "compType">) {
    const mapper = this.xlsx.convertJsonToWorkbook<TMonthlyReportResponse>(IncentiveMonthConfig)
    const exporter = this.xlsx.exportWorkbook(`ประมาณการ incentive ${req.month}`)
    return this.getMonthReport({ ...req, eventType: 3 })
      .pipe(
        map(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  predicateValueForParams = (value: unknown): value is TValidParamValue => {
    switch (typeof value) {
      case 'string': return true
      case 'number': return true
      case 'boolean': return true
      default: return false
    }
  }
  praseQuerParams = (data: Record<string, unknown>) =>
    Object.entries(data).reduce<Record<string, TValidParamValue>>(
      (params, [k, v]) => {
        const isValid = this.predicateValueForParams(v)
        if (isValid) return { ...params, [k]: v }
        return params
      },
      {}
    )

}

type TValidParamValue = string | number | boolean

export type TMonthlyReportReq = {
  compType: TCompType
  month: string
  eventType: number | null
}

