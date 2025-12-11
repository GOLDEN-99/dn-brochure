import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, combineLatestAll, filter, map, Observable, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { NotLightSummary } from './base-oi'
import * as XLSX from 'xlsx'
import { TFieldSelector } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class SupplierReportService {

  constructor() { }
  private url = `${environment.oi}/report/supplier`
  private api = inject(ApiService)
  private compType$ = new Subject<string>()
  private compCode$ = new Subject<string>()
  private comp$ = combineLatest([this.compType$, this.compCode$])
    .pipe(
      filter(([_, code]) => !!code),
      map(([compType, compCode]) => ({ compType, compCode })),
      shareReplay(2)
    )
  private convertToIso = ({ year, month, day }: NgbDateStruct) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  private month$ = new Subject<string>()
  private year$ = new Subject<string>()

  private paramWithMonth$: Observable<TPWithMonth> = combineLatest([this.comp$, this.month$]).pipe(map(([comp, month]) => ({ ...comp, month })))
  private paramWithYear$: Observable<TPWithYear> = combineLatest([this.comp$, this.year$]).pipe(map(([comp, year]) => ({ ...comp, year })))
  fetchMonth(date: NgbDateStruct, compCode: string, compType: string) {
    this.month$.next(this.convertToIso({ ...date, day: 1 }))
    this.compCode$.next(compCode)
    this.compType$.next(compType)
  }
  fetchYear({ year }: NgbDateStruct, compCode: string, compType: string) {
    this.year$.next(this.convertToIso({ year, month: 1, day: 1 }))
    this.compCode$.next(compCode)
    this.compType$.next(compType)
  }
  private queryByMonthDetail = ({ compCode, compType, month }: TPWithMonth) => this.api.get<TOiSupplierMonthDetialRes[]>(`${this.url}/monthly/${compType}/${compCode}/detail`, { params: { month } })
  private queryByMonth = ({ compCode, compType, month }: TPWithMonth) =>
    this.api.get<TOiSupplierRes[]>(`${this.url}/${compType}/${compCode}`, { params: { month } })
  private _monthReportMapper = ({ head, summary }: TOiSupplierRes) => [
    ...Object.entries(this._formatHead(head)),
    [],
    ...Object.entries(this._formatMothSummary(summary, head.incVat))
  ]

  private _monthReportDetialMapper = ({ head, summary }: TOiSupplierMonthDetialRes) => [
    ...this._headFormatter.map(f => [f.label, f.fn(head)]),
    [],
    this._monthDetialMapper.map(f => f.label),
    ...summary.map(s => this._monthDetialMapper.map(f => f.fn(s))),
  ]

  private _annualReportMapper = ({ head, monthly }: TOiSupplierAnnualRes) => [
    ...Object.entries(this._formatHead(head)).map(([key, value]) => [key, value]),
    [],
    ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    ...monthly.map((mon) => Object.entries(mon).map(([_, value]) => typeof value === 'number' ? value.toFixed(2) : value))
  ]
  exportSupplierMonthReport(compType: number, compCode: string, date: NgbDateStruct) {
    const month = this.convertToIso(date)
    const comp = compType === 1 ? 'DN' : 'HU'
    return this.queryByMonth({ compType: comp, compCode, month })
      .pipe(map(r => r.map(this._monthReportMapper)))
  }
  exportSupplierMonthDetialReport(compType: number, compCode: string, date: NgbDateStruct) {
    const month = this.convertToIso(date)
    const comp = compType === 1 ? 'DN' : 'HU'
    return this.queryByMonthDetail({ compType: comp, compCode, month })
      .pipe(map(r => r.map(this._monthReportDetialMapper)))
  }
  exportSupplierAnnualReport(compType: number, compCode: string, date: NgbDateStruct) {
    const year = this.convertToIso(date)
    const comp = compType === 1 ? 'DN' : 'HU'
    return this.queryByYear({ compType: comp, compCode, year })
      .pipe(map(r => r.map(this._annualReportMapper)))
  }
  exportManySheet = async (value: any[][][], filename?: string) => {
    const wb = XLSX.utils.book_new()
    for (let i = 0; i < value.length; i++) {
      const cur = value[i]
      const ws = XLSX.utils.aoa_to_sheet(cur)
      XLSX.utils.book_append_sheet(wb, ws, `${cur[0][1].substring(0, 10)}-${i + 1}`)
    }
    const d = new Date()
    const base = filename ? filename : d.getTime()
    const fName = base + '.xlsx'
    await XLSX.writeFileXLSX(wb, fName)
  }
  private queryByYear = ({ compCode, compType, year }: TPWithYear) =>
    this.api.get<TOiSupplierAnnualRes[]>(`${this.url}/annual/${compType}/${compCode}`, { params: { year } })

  private yearRes$ = this.paramWithYear$.pipe(switchMap(this.queryByYear))
  yearRes = toSignal(this.yearRes$, { initialValue: [] })
  displayYear = computed(() => this.yearRes().map(({ head: { compCode, compName, id } }) => ({ id, comp: `${compCode} ${compName}` })))

  private monthRes$ = this.paramWithMonth$.pipe(switchMap(this.queryByMonth))
  monthRes = toSignal(this.monthRes$, { initialValue: [] })
  displayMonth = computed(() => this.monthRes().map(({ head: { compCode, compName, id } }) => ({ id, comp: `${compCode} ${compName}` })))
  formatedMonthRes = computed(() => this.monthRes()
    .map(({ head, summary }) => ({
      head: this._formatHead(head),
      summary: this._formatMothSummary(summary, head.incVat)
    })))
  private _formatHead = (head: TMonthHead) => ({
    "ซัพพลายเออร์": `${head.compCode} ${head.compName}`,
    "ชื่อรายรับภายใน": `${head.displayName}`,
    "ชื่อกิจกรรม": head.eventName,
    "รวม vat": head.incVat ? 'รวม' : 'ไม่รวม',
    "dc": head.isDc ? 'หัก' : 'ไม่หัก',
    "rebate": head.isRebate ? 'หัก' : 'ไม่หัก',
    "compensate": head.isComp ? 'หัก' : 'ไม่หัก',
    "incentive": head.isInce ? 'หัก' : 'ไม่หัก',
  })

  private _headFormatter: TFieldSelector<TMonthHead>[] = [
    { label: "ซัพพลายเออร์", fn: (v) => `${v.compCode} ${v.compName}` },
    { label: "ชื่อรายรับภายใน", fn: (v) => v.displayName },
    { label: "ชื่อกิจกรรม", fn: (v) => v.eventName },
    { label: "รวม vat", fn: (v) => v.incVat ? 'รวม' : 'ไม่รวม' },
    { label: "dc", fn: (v) => v.isDc ? 'หัก' : 'ไม่หัก' },
    { label: "rebate", fn: (v) => v.isRebate ? 'หัก' : 'ไม่หัก' },
    { label: "compensate", fn: (v) => v.isComp ? 'หัก' : 'ไม่หัก' },
    { label: "incentive", fn: (v) => v.isInce ? 'หัก' : 'ไม่หัก' },
  ]

  private _monthDetialMapper: TFieldSelector<TOiSupplierDetial>[] = [
    { label: "เลขใบสั่งซื้อ (PO)", fn: (v) => v.orderNumb },
    { label: "เลขที่รับเข้า", fn: (v) => v.receNumb },
    { label: "วันที่รับเข้า", fn: (v) => v.receDate.split('T')[0] },
    { label: "เลขที่บิล", fn: (v) => v.billNumb },
    { label: "วันที่บิล", fn: (v) => v.billDate.split('T')[0] },
    { label: 'ยอดรวม', fn: (v) => v.totalCost.toFixed(2) },
    { label: 'หัก vat', fn: (v) => v.applyVat.toFixed(2) },
    { label: 'หัก dc', fn: (v) => v.applyDc.toFixed(2) },
    { label: 'หัก rebate', fn: (v) => v.applyRebate.toFixed(2) },
    { label: 'หัก compensate', fn: (v) => v.applyComp.toFixed(2) },
    { label: 'หัก incentive', fn: (v) => v.applyInce.toFixed(2) },
    { label: 'หัก ส่วนลดการค้า', fn: (v) => v.applyTrade.toFixed(2) },
    { label: 'cn', fn: (_) => 0 },
    { label: 'ยอดสุทธิ', fn: (v) => (v.totalCost - v.applyVat - v.applyDc - v.applyRebate - v.applyComp - v.applyInce - v.applyTrade).toFixed(2) }
  ]
  private _formatMothSummary = (summary: TOiSupplierSummary, incVat: boolean) => {
    const withVat = summary.totalCost - summary.applyComp - summary.applyRebate - summary.applyDc - summary.applyInce
    const finalValue = incVat ? withVat : (withVat - summary.applyVat)
    return {
      "ยอดจริง": summary.totalCost.toFixed(2),
      "หัก vat": summary.applyVat.toFixed(2),
      "หัก dc": summary.applyDc.toFixed(2),
      "หัก rebate": summary.applyRebate.toFixed(2),
      "หัก compensate": summary.applyComp.toFixed(2),
      "หัก incentive": summary.applyInce.toFixed(2),
      "ยอดซื้อเรียกเก็บ": (finalValue).toFixed(2)
    }
  }



  async exportTo() {
    const resArr = this.formatedMonthRes()
    const aoa = resArr.map(({ head, summary }) => [
      ...Object.entries(head).map(([key, value]) => [key, value]),
      [],
      ...Object.entries(summary).map(([k, v]) => [k, v])
    ])
    const wb = XLSX.utils.book_new()
    aoa.forEach((a, i) => {
      const ws = XLSX.utils.aoa_to_sheet(a)
      XLSX.utils.book_append_sheet(wb, ws, `${a[0][1].substring(0, 10)}-${i + 1}`)
    })
    const d = new Date()
    const iso = d.getTime() + '.xlsx'
    await XLSX.writeFileXLSX(wb, iso)
  }

  async annualExport() {
    const data = this.yearRes()
    const aoa = data.map(({ head, monthly }) => ({
      head: this._formatHead(head),
      monthly
    })).map(({ head, monthly }) => [
      ...Object.entries(head).map(([key, value]) => [key, value]),
      [],
      ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
      ...monthly.map((mon) => Object.entries(mon).map(([_, value]) => typeof value === 'number' ? value.toFixed(2) : value))
    ])
    const wb = XLSX.utils.book_new()
    aoa.forEach((a, i) => {
      const ws = XLSX.utils.aoa_to_sheet(a)
      XLSX.utils.book_append_sheet(wb, ws, `${(a[0][1] as string).substring(0, 10)}-${i + 1}`)
    })
    const d = new Date()
    const iso = d.getTime() + '-annual.xlsx'
    await XLSX.writeFileXLSX(wb, iso)
  }
  formater = (value: any) => {
    switch (typeof value) {
      case 'number': return Number(value).toFixed(2)
      case 'undefined': return ''
      case 'object': return JSON.stringify(value)
      default: return value
    }
  }
}

type TBaseParms = { compCode: string, compType: string }
type TPWithMonth = { month: string } & TBaseParms
type TPWithYear = { year: string } & TBaseParms

export type TOiSupplierSummary = {
  totalCost: number
  applyRebate: number
  applyDc: number
  applyComp: number
  applyInce: number
  applyVat: number
}

export type TPivot<T> = {
  fieldName: string
  jan: T
  feb: T
  mar: T
  apr: T
  may: T
  jun: T
  jul: T
  aug: T
  sep: T
  oct: T
  nov: T
  dec: T
}

type TMonthHead = Omit<NotLightSummary, 'company' | 'event'> & { compCode: string, compName: string, eventName: string }

export type TOiSupplierRes = {
  head: TMonthHead
  summary: TOiSupplierSummary
}

export type TOiSupplierDetial = {
  orderNumb: string
  receNumb: string
  receDate: string
  billNumb: string
  billDate: string
  totalCost: number
  applyVat: number
  applyDc: number
  applyRebate: number
  applyComp: number
  applyInce: number
  applyTrade: number
}

export type TOiSupplierMonthDetialRes = {
  head: TMonthHead
  summary: TOiSupplierDetial[]
}

export type TOiSupplierAnnualRes = {
  head: TMonthHead
  monthly: TPivot<number>[]
}