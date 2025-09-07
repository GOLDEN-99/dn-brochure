import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { convertToIso, TDate } from '../../lib';
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
  private _getReceiptReport = (compType: string) => this._api.get<TReceiptReport[]>(`${this.basePath}/${compType}/receipts`)
  private _getAnnualReport = ({ compType, year }: TQueryWithYear) => this._api.get<TAnnualReport[]>(`${this.basePath}/${compType}`, { params: { year } })
  private _getLighyBoxReport = ({ compType, year }: TQueryWithYear) => this._api.get<TLightBoxReport[]>(`${this.basePath}/${compType}/annual/light-box`, { params: { year } })
  private _getAnnualIncomeReport = ({ compType, year }: TQueryWithYear) => this._api.get<TAnnualIncomeReport[]>(`${this.basePath}/${compType}/annual`, { params: { year } })
  private _getMonthBuyReport = ({ compType, month }: TQueryWithMonth) => this._api.get<TMonthBuyReport[]>(`${this.basePath}/${compType}/month/buy-list`, { params: { month } })
  private _getMonthInceReport = ({ compType, month }: TQueryWithMonth) => this._api.get<TMonthInceReport[]>(`${this.basePath}/${compType}/month/ince`, { params: { month } })
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
    { label: 'id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart.split('T')[0] },
    { label: 'จบ', fn: v => v.periodEnd.split('T')[0] },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome }
  ]
  private _receiptMapper: TFieldSelector<TReceiptReport>[] = [
    { label: 'id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart.split('T')[0] },
    { label: 'จบ', fn: v => v.periodEnd.split('T')[0] },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome },
    { label: 'เลขที่ใบแจ้งหนี้', fn: v => v.invNumb },
    { label: 'วันที่ใบแจ้งหนี้', fn: v => v.invDate.split('T')[0] },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.invAmount },
    { label: 'หมายเหตุ', fn: v => v.invRemark },
  ]
  private _lightboxMapper: TFieldSelector<TLightBoxReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart.split('T')[0] },
    { label: 'จบ', fn: v => v.periodEnd.split('T')[0] },
    { label: 'รหัสสาขา', fn: v => v.branchCode },
    { label: 'ชื่อสาขา', fn: v => v.branchName },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome }
  ]
  private _annualIncomeMapper: TFieldSelector<TAnnualIncomeReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'เริ่ม', fn: v => v.startDate.split('T')[0] },
    { label: 'จบ', fn: v => v.endDate.split('T')[0] },
    { label: 'ยอดซื้อ q1', fn: v => v.q1.totalAmount },
    { label: 'รายได้ q1', fn: v => v.q1.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q1', fn: v => v.q1.orderAmount },
    { label: 'ยอดใบลดหนี้ q1', fn: v => v.q1.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q1', fn: v => v.q1.invAmount },
    { label: 'ยอดใบเสร็จ q1', fn: v => v.q1.receAmount },
    { label: 'ยอดซื้อ q2', fn: v => v.q2.totalAmount },
    { label: 'รายได้ q2', fn: v => v.q2.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q2', fn: v => v.q2.orderAmount },
    { label: 'ยอดใบลดหนี้ q2', fn: v => v.q2.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q2', fn: v => v.q2.invAmount },
    { label: 'ยอดใบเสร็จ q2', fn: v => v.q2.receAmount },
    { label: 'ยอดซื้อ h1', fn: v => v.h1.totalAmount },
    { label: 'รายได้ h1', fn: v => v.h1.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล h1', fn: v => v.h1.orderAmount },
    { label: 'ยอดใบลดหนี้ h1', fn: v => v.h1.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ h1', fn: v => v.h1.invAmount },
    { label: 'ยอดใบเสร็จ h1', fn: v => v.h1.receAmount },
    { label: 'ยอดซื้อ q3', fn: v => v.q3.totalAmount },
    { label: 'รายได้ q3', fn: v => v.q3.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q3', fn: v => v.q3.orderAmount },
    { label: 'ยอดใบลดหนี้ q3', fn: v => v.q3.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q3', fn: v => v.q3.invAmount },
    { label: 'ยอดใบเสร็จ q3', fn: v => v.q3.receAmount },
    { label: 'ยอดซื้อ q4', fn: v => v.q4.totalAmount },
    { label: 'รายได้ q4', fn: v => v.q4.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q4', fn: v => v.q4.orderAmount },
    { label: 'ยอดใบลดหนี้ q4', fn: v => v.q4.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q4', fn: v => v.q4.invAmount },
    { label: 'ยอดใบเสร็จ q4', fn: v => v.q4.receAmount },
    { label: 'ยอดซื้อ h2', fn: v => v.h2.totalAmount },
    { label: 'รายได้ h2', fn: v => v.h2.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล h2', fn: v => v.h2.orderAmount },
    { label: 'ยอดใบลดหนี้ h2', fn: v => v.h2.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ h2', fn: v => v.h2.invAmount },
    { label: 'ยอดใบเสร็จ h2', fn: v => v.h2.receAmount },
    { label: 'ยอดซื้อ', fn: v => v.y.totalAmount },
    { label: 'รายได้', fn: v => v.y.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล', fn: v => v.y.orderAmount },
    { label: 'ยอดใบลดหนี้', fn: v => v.y.creditAmount },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.y.invAmount },
    { label: 'ยอดใบเสร็จ', fn: v => v.y.receAmount },
  ]
  private _monthbuyMapper: TFieldSelector<TMonthBuyReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'หัก dc', fn: v => this.formatDisc(v.isDc) },
    { label: 'หัก rebate', fn: v => this.formatDisc(v.isRebate) },
    { label: 'หัก compensate', fn: v => this.formatDisc(v.isComp) },
    { label: 'หัก incentive', fn: v => this.formatDisc(v.isInce) },
    { label: 'หัก vat', fn: v => this.formatDisc(!v.incVat) },
    { label: 'เลข rece', fn: v => v.receNumb },
    { label: 'วันที่ rece', fn: v => v.receDate.split('T')[0] },
    { label: 'เลขที่บิล', fn: v => v.billNumb },
    { label: 'วันที่บิล', fn: v => v.billDate.split('T')[0] },
    { label: 'ยอด rece', fn: v => v.totalCost },
    { label: 'dc', fn: v => v.dcDisc },
    { label: 'rebate', fn: v => v.rebateDisc },
    { label: 'compensate', fn: v => v.compDisc },
    { label: 'incentive', fn: v => v.inceDisc },
    { label: 'vat', fn: v => v.totalVat },
    { label: 'subtotal', fn: v => v.subtotal },
    { label: 'ยอดซื้อคำนวน', fn: v => v.calAmount },
    { label: 'ยอด cn', fn: v => v.cn },
    { label: 'ยอดบันทึก', fn: v => v.actualAmount },
    { label: 'เหตุผล', fn: v => v.reason },
    { label: 'รายได้', fn: v => v.incomeAmount }
  ]
  private _monthinceMapper: TFieldSelector<TMonthInceReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'เริ่ม', fn: v => v.startDate.split('T')[0] },
    { label: 'จบ', fn: v => v.endDate.split('T')[0] },
    { label: 'หมายเหตุ', fn: v => v.incomeRemark },
    { label: 'รายได้', fn: v => v.incomeAmount }

  ]
  private formatInvoice = this._mapToAoa(this._invocieMapper)
  private formatReceipt = this._mapToAoa(this._receiptMapper)
  private formatLight = this._mapToAoa(this._lightboxMapper)
  private formatAnnualIncome = this._mapToAoa(this._annualIncomeMapper)
  private formatMonthbuy = this._mapToAoa(this._monthbuyMapper)
  private formatMonthince = this._mapToAoa(this._monthinceMapper)
  exportInvoiceReport(compType: number) {
    const comp = this._formatCompType(compType)
    return this._getInvoiceReport(comp).pipe(map(this.formatInvoice))
  }
  exportReceiptReport(compType: number) {
    const comp = this._formatCompType(compType)
    return this._getReceiptReport(comp).pipe(map(this.formatReceipt))
  }
  exportLightReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const year = this._getIso({ year: date.year, month: 1, day: 1 })
    return this._getLighyBoxReport({ compType: comp, year }).pipe(map(this.formatLight))
  }
  exportAnnualIncomeReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const year = this._getIso({ year: date.year, month: 1, day: 1 })
    return this._getAnnualIncomeReport({ compType: comp, year }).pipe(map(this.formatAnnualIncome))
  }
  exportMonthbuyReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const month = this._getIso({ year: date.year, month: date.month, day: 1 })
    return this._getMonthBuyReport({ compType: comp, month }).pipe(map(this.formatMonthbuy))
  }
  private formatDisc = (v: boolean) => v ? 'ไม่หัก' : 'หัก'

  exportInceReport(compType: number, date: TDate) {
    const comp = this._formatCompType(compType)
    const month = this._getIso({ year: date.year, month: date.month, day: 1 })
    return this._getMonthInceReport({ compType: comp, month }).pipe(map(this.formatMonthince))
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

type TBaseReport = {
  displayName: string
  compCode: string
  compType: string
  compName: string
  eventName: string
  incomeName: string
}

type TInvocieReport = {
  id: number
  periodId: number
  periodName: string
  periodStart: string
  periodEnd: string
  totalAmount: number
  totalIncome: number
} & TBaseReport

type TReceiptReport = {
  invNumb: string
  invAmount: number
  invDate: string
  invRemark: string
} & TInvocieReport

type TAnnualReport = {}

type TLightBoxReport = {
  displayName: string
  compCode: string
  compName: string
  compType: string
  branchCode: string
  branchName: string
  incomeName: string
  eventName: string
  periodName: string
  periodStart: string
  periodEnd: string
  totalAmount: number
  totalIncome: number
}

type TAnnaulReportItem = {
  totalAmount: number
  totalIncome: number
  orderAmount: number
  creditAmount: number
  invAmount: number
  receAmount: number
}

type TAnnualIncomeReport = {
  id: number
  period: number
  startDate: string
  endDate: string
  q1: TAnnaulReportItem
  q2: TAnnaulReportItem
  q3: TAnnaulReportItem
  q4: TAnnaulReportItem
  h1: TAnnaulReportItem
  h2: TAnnaulReportItem
  y: TAnnaulReportItem
} & TBaseReport

type TMonthBuyReport = {
  incVat: boolean
  isDc: boolean
  isRebate: boolean
  isInce: boolean
  isComp: boolean
  receNumb: string
  receDate: string
  billNumb: string
  billDate: string
  totalCost: number
  totalVat: number
  dcDisc: number
  rebateDisc: number
  inceDisc: number
  compDisc: number
  subtotal: number
  calAmount: number
  cn: number
  actualAmount: number
  reason: string
  incomeAmount: number
} & TBaseReport

type TMonthInceReport = {
  incomeRemark: string
  incomeAmount: number
  startDate: string
  endDate: string
} & TBaseReport