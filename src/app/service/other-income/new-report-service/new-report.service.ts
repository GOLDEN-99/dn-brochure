import { inject, Injectable } from '@angular/core';
import { TCompType } from '../../../types';
import { ApiService } from '../../api/api.service';
import { environment } from '../../../../environments/environment';
import { XLSXReportService } from '../../xlsx-report/xlsx-report.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { DCMonthConfig, IncentiveMonthConfig, LightBoxMonthConfig, TMonthlyReportResponse } from './monthly-report-config';
import { AllContractConfig, TGetAllReportResponse } from './all-contract-report-config';
import { AppendBillDiscountConfig, AppendFreeProductConfig, IssueCreditReportConfig, IssueInvoiceReportConfig, IssueReceiptReportConfig, TIssueDocumentReportResponse, TIssueReceiptReportResponse } from './issuing-document-config';
import { PeriodDualDateConfig, TPeriodDualDateResponse } from './period-dual-date-config';


@Injectable({
  providedIn: 'root'
})
export class NewReportService {

  constructor() { }

  private readonly api = inject(ApiService)
  private readonly baseUrl = environment.oi + '/report/account/v2'

  private readonly _oldUrl = environment.oi + '/report/account'

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
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getLightBoxReport(req: Pick<TMonthlyReportReq, "month" | "compType">) {
    const mapper = this.xlsx.convertJsonToWorkbook<TMonthlyReportResponse>(LightBoxMonthConfig)
    const exporter = this.xlsx.exportWorkbook(`ประมาณการ light box ${req.month}`)
    return this.getMonthReport({ ...req, eventType: 2 })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getInceMonthReport(req: Pick<TMonthlyReportReq, "month" | "compType">) {
    const mapper = this.xlsx.convertJsonToWorkbook<TMonthlyReportResponse>(IncentiveMonthConfig)
    const exporter = this.xlsx.exportWorkbook(`ประมาณการ incentive ${req.month}`)
    return this.getMonthReport({ ...req, eventType: 3 })
      .pipe(
        switchMap(res => mapper(res)),
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

  getPeriodDualDate({ compType }: { compType: TCompType }) {
    const mapper = this.xlsx.convertJsonToWorkbook<TPeriodDualDateResponse>(PeriodDualDateConfig)
    const exporter = this.xlsx.exportWorkbook(`ตรวจสอบความแตกต่าง ${compType}`)
    return this.api.get<TPeriodDualDateResponse[]>(`${this.baseUrl}/period-dual-date`, { params: { CompType: compType } })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getContractReport(req: TGetContractRequest) {
    const [year, _] = req.year.split('T')[0].split('-')
    const mapper = this.xlsx.convertJsonToWorkbook(AllContractConfig);
    const exporter = this.xlsx.exportWorkbook(`รายการรายได้อื่นๆ ${year}`)
    return this.api.get<TGetAllReportResponse[]>(`${this.baseUrl}/contract`, { params: req })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  private getIssueDocumentReport(params: TGetIssueDocumentReq) {
    return this.api.get<TIssueDocumentReportResponse[]>(`${this.baseUrl}/issue`, { params })
  }

  getIssueFreeProduct({ compType }: Pick<TGetIssueDocumentReq, 'compType'>) {
    const mapper = this.xlsx.convertJsonToWorkbook(AppendFreeProductConfig);
    const exporter = this.xlsx.exportWorkbook("รายงานรอแนบสินค้าแถม");
    return this.getIssueDocumentReport({ compType, incomeType: 'products' })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }
  getIssueBillDiscount({ compType }: Pick<TGetIssueDocumentReq, 'compType'>) {
    const mapper = this.xlsx.convertJsonToWorkbook(AppendBillDiscountConfig);
    const exporter = this.xlsx.exportWorkbook("รายงานรอ CN ลดมากับบิล");
    return this.getIssueDocumentReport({ compType, incomeType: 'bills' })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }
  getIssueInvocie({ compType }: Pick<TGetIssueDocumentReq, 'compType'>) {
    const mapper = this.xlsx.convertJsonToWorkbook(IssueInvoiceReportConfig);
    const exporter = this.xlsx.exportWorkbook("รายงานรอออกใบแจ้งหนี้");
    return this.getIssueDocumentReport({ compType, incomeType: 'invoices' })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }
  getIssueCredit({ compType }: Pick<TGetIssueDocumentReq, 'compType'>) {
    const mapper = this.xlsx.convertJsonToWorkbook(IssueCreditReportConfig);
    const exporter = this.xlsx.exportWorkbook("รายการรอใบลดหนี้");
    return this.getIssueDocumentReport({ compType, incomeType: 'credit' })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

  getIssueReceipt({ compType }: { compType: string }) {
    const mapper = this.xlsx.convertJsonToWorkbook<TIssueReceiptReportResponse>(IssueReceiptReportConfig);
    const exporter = this.xlsx.exportWorkbook("รายงานรอรับใบเสร็จ");
    return this.api.get<TIssueReceiptReportResponse[]>(`${this.baseUrl}/receipt`, { params: { CompType: compType } })
      .pipe(
        switchMap(res => mapper(res)),
        switchMap(wb => exporter(wb)),
        catchError(err => throwError(() => err))
      )
  }

}

type TValidParamValue = string | number | boolean

export type TMonthlyReportReq = {
  compType: TCompType
  month: string
  eventType: number | null
}

export type TGetContractRequest = {
  compType: TCompType
  year: string
}

export type TInvoiceRequest = {
  compType: string
  reportType: string
}

export type TGetIssueDocumentReq = {
  compType: string
  incomeType: string // products | bills | invoices | credit
}