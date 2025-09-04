import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { convertToIso } from '../../lib';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TFieldSelector, TObj } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OiAccountReportService {

  constructor() { }
  private _cal = inject(NgbCalendar)
  private _today = this._cal.getToday()
  private _initValue: TAccountReportQuery = {
    compType: 1,
    day: this._today.day,
    month: this._today.month,
    year: this._today.year,
  }
  param = signal<TAccountReportQuery>(this._initValue)
  private _params$ = toObservable(this.param)
  private _baseQuery$ = this._params$.pipe(map(q => this._formatQuery(q)))
  private _monthQuery$ = this._params$.pipe(map(q => this._formateMonthQuery(q)))
  private _yearQuery$ = this._params$.pipe(map(q => this._formateYearQuery(q)))
  private _formatQuery = ({ compType: compTypeEnum }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    return { compType }
  }
  private _formateYearQuery = ({ compType: compTypeEnum, year: curYear }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    const year = this._getIso({ year: curYear, month: 1, day: 1 })
    return { compType, year }
  }
  private _formateMonthQuery = ({ compType: compTypeEnum, ...res }: TAccountReportQuery) => {
    const compType = this._formatCompType(compTypeEnum)
    const month = this._getIso({ ...res, day: 1 })
    return { compType, month }
  }
  private _catchSilent = <T>(fallback: T) => catchError<T, Observable<T>>((err) => { console.log(err); return of(fallback) })
  private url = environment.oi
  private basePath = `${this.url}/report/account`
  private _api = inject(ApiService)
  private _getIso = convertToIso
  private _formatCompType = (compType: number) => compType === 1 ? 'DN' : 'HU'
  private _getInvoiceReport = (compType: string) => this._api.get<TInvocieReport[]>(`${this.basePath}/${compType}/invoices`)
  private _getReceiptReport = (compType: string) => this._api.get<TReceiptReport[]>(`${this.basePath}/${compType}/invoices`)
  private _getAnnualReport = ({ compType, year }: TQueryWithYear) => this._api.get<TAnnualReport[]>(`${this.basePath}/${compType}`, { params: { year } })
  private invoice$ = this._baseQuery$.pipe(
    switchMap(({ compType }) => this._getInvoiceReport(compType)),
    this._catchSilent<TAnnualReport[]>([])
  )
  invoice = toSignal(this.invoice$, { initialValue: [] })
  private receipt$ = this._baseQuery$.pipe(
    switchMap(({ compType }) => this._getReceiptReport(compType)),
    this._catchSilent<TReceiptReport[]>([])
  )
  receipt = toSignal(this.receipt$, { initialValue: [] })
  private annual$ = this._yearQuery$.pipe(
    switchMap(q => this._getAnnualReport(q)),
    this._catchSilent<TAnnualReport[]>([])
  )
  annual = toSignal(this.annual$, { initialValue: [] })
  private _mapToAoa = <T extends TObj>(mapper: TFieldSelector<T>[]) =>
    (data: T[]) => [mapper.map(({ label }) => label), ...data.map(d => mapper.map(({ fn }) => fn(d)))]
  private _invocieMapper: TFieldSelector<TInvocieReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart },
    { label: 'เริ่ม', fn: v => v.periodEnd }
  ]
  exportInvoiceReport(compType: number) {
    const comp = this._formatCompType(compType)
    return this._getInvoiceReport(comp)
  }
}

type TAccountReportQuery = {
  compType: number
  day: number
  month: number
  year: number
}

type TBaseQuery = {
  compType: string
}

type TQueryWithYear = { year: string } & TBaseQuery
type TQueryWithMonth = { month: string } & TBaseQuery

type TInvocieReport = {
  id: number
  displayName: string
  compCode: string
  compType: string
  compName: string
  eventName: string
  incomeName: string
  periodId: number
  periodName: string
  periodStart: string
  periodEnd: string
  totalAmount: number
  totalIncome: number
}

type TReceiptReport = {}

type TAnnualReport = {}