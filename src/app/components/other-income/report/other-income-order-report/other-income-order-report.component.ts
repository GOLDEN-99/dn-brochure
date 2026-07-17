import { Component, computed, inject, input } from '@angular/core';
import { ApiService } from '../../../../service/api/api.service';
import { environment } from '../../../../../environments/environment';
import { catchError, combineLatest, map, Observable, of, Subject, switchMap, tap, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TPivot } from '../../../../service/other-income/supplier-report.service';
import { NotLightSummary } from '../../../../service/other-income/base-oi';
import { TIncome } from '../../../../service/other-income/income.service';
import { TEvent } from '../../../../service/other-income/event.service';
import { LoadingService } from '../../../../service/loading/loading.service';

@Component({
  selector: 'app-other-income-order-report',
  imports: [],
  templateUrl: './other-income-order-report.component.html',
  styleUrl: './other-income-order-report.component.scss'
})
export class OtherIncomeOrderReportComponent {
  private readonly load = inject(LoadingService)
  year = input.required<number>()
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/report/account`
  private readonly year$ = new Subject<number>()
  private readonly isoYear$ = this.year$.pipe(map(y => `${y}-01-01`))
  private readonly compType$ = new Subject<string>()
  private readonly param$ = combineLatest([this.compType$, this.isoYear$]).pipe(map(([compType, year]) => ({ compType, year })))
  compType = toSignal(this.compType$, { initialValue: "" })
  disable = computed(() => !this.compType())
  private readonly getOrderReport = ({ compType, year }: { compType: string, year: string }) =>
    this.api.get<TSummaryObject[]>(`${this.url}/${compType}/with-po`, { params: { year } })
  private readonly raw$: Observable<TSummaryObject[]> = this.param$.pipe(
    switchMap(this.getOrderReport),
    tap(() => this.load.endLoad()),
    catchError(err => of([])),
  )
  private readonly raw = toSignal(this.raw$, { initialValue: [] })
  cannotExport = computed(() => this.raw().length === 0)
  formatHead = computed(() => this.raw().map(this.primaryFormatter))

  fetchDN = () => {
    this.load.startLoad()
    this.year$.next(this.year())
    this.compType$.next('DN')
  }

  fetchHU = () => {
    this.load.startLoad()
    this.year$.next(this.year())
    this.compType$.next('hu')
  }

  async toExcel() {
    this.load.startLoad()
    const data = this.formatHead()
    const aoa = data.map(({ head, report }) => [
      ...this.mapPrimaryHeadToArray(head),
      [],
      ['งวด', 'วันที่ใบ po', 'เลข po', 'วันที่ iv', 'เลข iv', 'วันที่รับเข้า', 'เลข rc', 'รายได้คาดการ', 'รายได้จริง'],
      ...report.map(this.mapOrderToArray(head.period))
    ])

    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    aoa.forEach((a, i) => {
      const ws = XLSX.utils.aoa_to_sheet(a)
      XLSX.utils.book_append_sheet(wb, ws, `${(a[0][1]).substring(0, 10)}-${i + 1}`)
    })
    const d = new Date()
    const iso = d.getTime() + '-order.xlsx'
    await XLSX.writeFileXLSX(wb, iso)
    this.load.endLoad()
  }

  private readonly primaryFormatter = ({ head, income, event, report }: TSummaryObject): TPrimaryResult => {
    const { displayName, compCode, compName, capAmount, period, startDate, endDate, isComp, isDc, isInce, isRebate, incVat } = head
    const modCap = typeof capAmount === 'number' ? capAmount.toFixed(2) : 'ไม่กำหนด'
    const modDc = isDc ? 'หัก dc' : ''
    const modRebate = isRebate ? 'หัก rebate' : ''
    const modComp = isComp ? 'หัก compensate' : ''
    const modInce = isInce ? 'หัก incentive' : ''
    const modVat = incVat ? '' : 'หัก vat'
    const condition = [modDc, modRebate, modCap, modComp, modInce, modVat].filter(m => m !== '').join('/')
    const { eventName } = event
    const { incomeName } = income
    const modHead: TModHead = {
      comp: `${compCode} ${compName}`,
      displayName,
      eventName,
      incomeName,
      capAmount: modCap,
      period,
      startDate,
      endDate,
      condition
    }
    return { head: modHead, report }
  }

  private readonly mapPrimaryHeadToArray = ({ period, comp, capAmount, displayName, eventName, incomeName, startDate, endDate, condition }: TModHead) =>
    [
      ["ซัพพลายเออร์", comp],
      ["ชื่อเรียก", displayName],
      ["กิจกรรม", eventName],
      ["รับรู้", incomeName],
      ["เริ่ม", startDate],
      ["จบ", endDate],
      ["เงื่อนไข", condition],
      ["จ่ายไม่เกิน", capAmount],
      ["ระยะเวลา(เดือน)", String(period)]
    ]

  private readonly mapOrderToArray = (period: number) =>
    ({ createDate, orderDate, orderNumb, supInvDate, supInvNumb, receNumb, receDate, expIncome, actualIncome }: TASOrder) => {
      const m = createDate.split('t')[0].split('-').map(Number)[1]
      return [String(Math.ceil(m / period)), orderDate, orderNumb, supInvDate, supInvNumb, receDate, receNumb, expIncome.toFixed(2), actualIncome.toFixed(2)]
    }
}

type TASOrder = {
  createDate: string
  orderNumb: string
  orderDate: string
  supInvNumb: string
  supInvDate: string
  receNumb: string
  receDate: string
  actualIncome: number
  expIncome: number
}
type TorderReport = TPivot<TASOrder[]>

type TSummaryObject = {
  head: Omit<NotLightSummary, 'company'> & { compCode: string, compName: string }
  income: TIncome
  event: TEvent
  report: TASOrder[]
}

type TModHead = {
  comp: string
  displayName: string
  eventName: string
  incomeName: string
  capAmount: string
  period: number
  startDate: string
  endDate: string
  condition: string
}

type TPrimaryResult = {
  head: TModHead
  report: TASOrder[]
}