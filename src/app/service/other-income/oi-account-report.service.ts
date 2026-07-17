import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { convertToIso, TDate } from '../../lib';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TFieldSelector, TObj } from '../../types';
import { formatAnnualIncome, formatRangeInvRece, formatInvoice, formatLight, formatMonthbuy, formatMonthince, formatRangeBill, formatRangeCredit, formatReceipt } from '../../lib/other-income/other-income';
import { TAccountReportQuery, TAnnualIncomeReport, TAnnualReport, TIncomeListReport, TInvocieReport, TLightBoxReport, TMonthBuyReport, TMonthInceReport, TQueryWithMonth, TQueryWithRange, TQueryWithYear, TRangeBillReport, TRangeCreditReport, TRangeInvReceReport, TReceiptReport } from '../../lib/other-income/other-income.type';

@Injectable({
  providedIn: 'root'
})
export class OiAccountReportService {

  constructor() { }
  private readonly _cal = inject(NgbCalendar)
  private readonly _today = this._cal.getToday()
  private readonly _initValue: TAccountReportQuery = {
    compType: 1,
    day: this._today.day,
    month: this._today.month,
    year: this._today.year,
  }
  param = signal<TAccountReportQuery>(this._initValue)
  private readonly _params$ = toObservable(this.param)
  private readonly _baseQuery$ = this._params$.pipe(map(q => this._formatQuery(q)))
  private readonly _monthQuery$ = this._params$.pipe(map(q => this._formateMonthQuery(q)))
  private readonly _yearQuery$ = this._params$.pipe(map(q => this._formateYearQuery(q)))
  private readonly _formatQuery = ({ compType: compTypeEnum }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    return { compType }
  }
  private readonly _formateYearQuery = ({ compType: compTypeEnum, year: curYear }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    const year = this._getIso({ year: curYear, month: 1, day: 1 })
    return { compType, year }
  }
  private readonly _formateMonthQuery = ({ compType: compTypeEnum, ...res }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    const month = this._getIso({ ...res, day: 1 })
    return { compType, month }
  }
  private readonly _catchSilent = <T>(fallback: T) => catchError<T, Observable<T>>((err) => { console.log(err); return of(fallback) })
  private readonly url = environment.oi
  private readonly basePath = `${this.url}/report/account`
  private readonly _api = inject(ApiService)
  private readonly _getIso = convertToIso
  private readonly _formatCompType = (compType: number) => compType === 1 ? 'DN' : 'HU'
  private readonly _getInvoiceReport = (compType: string, reportType: string) => this._api.get<TInvocieReport[]>(`${this.basePath}/${compType}/invoices`, { params: { reportType } })
  private readonly _getReceiptReport = (compType: string) => this._api.get<TReceiptReport[]>(`${this.basePath}/${compType}/receipts`)
  // private readonly _getAnnualReport = ({ compType, year }: TQueryWithYear) => this._api.get<TAnnualReport[]>(`${this.basePath}/${compType}`, { params: { year } })
  private readonly _getLighyBoxReport = ({ compType, year }: TQueryWithYear) => this._api.get<TLightBoxReport[]>(`${this.basePath}/${compType}/annual/light-box`, { params: { year } })
  private readonly _getAnnualIncomeReport = ({ compType, year }: TQueryWithYear) => this._api.get<TAnnualIncomeReport[]>(`${this.basePath}/${compType}/annual`, { params: { year } })
  private readonly _getMonthBuyReport = ({ compType, month }: TQueryWithMonth) => this._api.get<TMonthBuyReport[]>(`${this.basePath}/${compType}/month/buy-list`, { params: { month } })
  private readonly _getMonthInceReport = ({ compType, month }: TQueryWithMonth) => this._api.get<TMonthInceReport[]>(`${this.basePath}/${compType}/month/ince`, { params: { month } })
  private readonly _getRangeBillReport = ({ compType, startDate, endDate }: TQueryWithRange) => this._api.get<TRangeBillReport[]>(`${this.basePath}/${compType}/range/bill`, { params: { startDate, endDate } })
  private readonly _getRangeProductReport = ({ compType, startDate, endDate }: TQueryWithRange) => this._api.get<TRangeBillReport[]>(`${this.basePath}/${compType}/range/product`, { params: { startDate, endDate } })
  private readonly _getRangeInvReceReport = ({ compType, startDate, endDate }: TQueryWithRange) => this._api.get<TRangeInvReceReport[]>(`${this.basePath}/${compType}/range/inv-rece`, { params: { startDate, endDate } })
  private readonly _getRangeCreditReport = ({ compType, startDate, endDate }: TQueryWithRange) => this._api.get<TRangeCreditReport[]>(`${this.basePath}/${compType}/range/credit`, { params: { startDate, endDate } })

  private readonly invoice$ = this._baseQuery$.pipe(
    switchMap(({ compType }) => this._getInvoiceReport(compType, 'invoice')),
    this._catchSilent<TAnnualReport[]>([])
  )
  invoice = toSignal(this.invoice$, { initialValue: [] })
  private readonly credit$ = this._baseQuery$.pipe(
    switchMap(({ compType }) => this._getInvoiceReport(compType, 'credit')),
    this._catchSilent<TAnnualReport[]>([])
  )
  cresit = toSignal(this.credit$, { initialValue: [] })
  private readonly receipt$ = this._baseQuery$.pipe(
    switchMap(({ compType }) => this._getReceiptReport(compType)),
    this._catchSilent<TReceiptReport[]>([])
  )
  receipt = toSignal(this.receipt$, { initialValue: [] })
  // private readonly annual$ = this._yearQuery$.pipe(
  //   switchMap(q => this._getAnnualReport(q)),
  //   this._catchSilent<TAnnualReport[]>([])
  // )
  // annual = toSignal(this.annual$, { initialValue: [] })
  private readonly _mapToAoa = <T extends TObj>(mapper: TFieldSelector<T>[]) =>
    (data: T[]) => [mapper.map(({ label }) => label), ...data.map(d => mapper.map(({ fn }) => fn(d)))]

  exportInvoiceReport(compType: number, reportType: string) {
    const comp = this._formatCompType(compType)
    const withComp = formatInvoice(comp)
    return this._getInvoiceReport(comp, reportType).pipe(map(withComp))
  }
  exportReceiptReport(compType: number) {
    const comp = this._formatCompType(compType)
    const withComp = formatReceipt(comp)
    return this._getReceiptReport(comp).pipe(map(withComp))
  }
  exportLightReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const year = this._getIso({ year: date.year, month: 1, day: 1 })
    const withComp = formatLight(comp)
    return this._getLighyBoxReport({ compType: comp, year }).pipe(map(withComp))
  }
  exportAnnualIncomeReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const year = this._getIso({ year: date.year, month: 1, day: 1 })
    const withComp = formatAnnualIncome(comp)
    return this._getAnnualIncomeReport({ compType: comp, year }).pipe(map(withComp))
  }
  exportMonthbuyReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatMonthbuy(comp)
    const month = this._getIso({ year: date.year, month: date.month, day: 1 })
    return this._getMonthBuyReport({ compType: comp, month }).pipe(map(withComp))
  }

  exportInceReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatMonthince(comp)
    const month = this._getIso({ year: date.year, month: date.month, day: 1 })
    return this._getMonthInceReport({ compType: comp, month }).pipe(map(withComp))
  }

  exportBillReport(compType: number, start: TDate, end: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatRangeBill(comp)
    const startDate = this._getIso({ year: start.year, month: start.month, day: 1 })
    const endDate = this._getIso({ year: end.year, month: end.month, day: 1 })
    return this._getRangeBillReport({ compType: comp, startDate, endDate }).pipe(map(withComp))
  }

  exportProductReport(compType: number, start: TDate, end: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatRangeBill(comp)
    const startDate = this._getIso({ year: start.year, month: start.month, day: 1 })
    const endDate = this._getIso({ year: end.year, month: end.month, day: 1 })
    return this._getRangeProductReport({ compType: comp, startDate, endDate }).pipe(map(withComp))
  }

  exportInvReceReport(compType: number, start: TDate, end: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatRangeInvRece(comp)
    const startDate = this._getIso({ year: start.year, month: start.month, day: 1 })
    const endDate = this._getIso({ year: end.year, month: end.month, day: 1 })
    return this._getRangeInvReceReport({ compType: comp, startDate, endDate }).pipe(map(withComp))
  }

  exportCreditReport(compType: number, start: TDate, end: TDate) {
    const comp = this._formatCompType(compType)
    const withComp = formatRangeCredit(comp)
    const startDate = this._getIso({ year: start.year, month: start.month, day: 1 })
    const endDate = this._getIso({ year: end.year, month: end.month, day: 1 })
    return this._getRangeCreditReport({ compType: comp, startDate, endDate }).pipe(map(withComp))
  }

  getIncomeList(compType: number): Observable<TIncomeListReport[]> {
    const comp = this._formatCompType(compType)
    return this._api.get<TIncomeListReport[]>(`${this.url}/other-income/${comp}/list`)
  }
}

