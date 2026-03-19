import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotLightSingle, TContactHead, TExtendedIncomeItem, TPopulatedPeriodResult } from './base-oi';
import { TCompType } from '../../types';
import { TOIComp } from './company.service';


export type TPairDetail = {
  id: number
  displayName: string
  dn: NotLightSingle[]
  hu: NotLightSingle[]
}

@Injectable({
  providedIn: 'root'
})
export class OiNotLightDualService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  getDetail(pairId: number) {
    return this.api.get<TPairDetail>(`${this.url}/other-income/pair/${pairId}/detail`)
  }

  private readonly fetch$ = new BehaviorSubject<number | null>(null)

  fetchById(pairId: number) {
    this.fetch$.next(pairId)
  }

  refetch() {
    const id = this.fetch$.getValue()
    if (id !== null) this.fetch$.next(id)
  }

  private readonly selectIncome = (compType: TCompType) => (record: NotLightSingle): TExtendedIncomeItem[] => {
    const { incomeList } = record
    return incomeList.map(i => ({ ...i, compType }) satisfies TExtendedIncomeItem)
  }

  private readonly selectDNIncome = this.selectIncome("DN")
  private readonly selectHUIncome = this.selectIncome("HU")

  mergeList = computed(() => {
    const detail = this.detail()
    if (!detail) return []
    const { dn, hu } = detail
    return [...this.selectDNIncome(dn[0]), ...this.selectHUIncome(hu[0])].sort((a, b) => a.id - b.id);
  })

  dnSummary = computed(() => {
    const dnList = this.detail()?.dn[0].incomeList ?? []
    return dnList.reduce(({ accAmount, accInc, accCal }, { actualAmount, calAmount, incomeAmount }) => {
      return { accAmount: accAmount + actualAmount, accInc: accInc + incomeAmount, accCal: calAmount + accCal }
    }, { accAmount: 0, accInc: 0, accCal: 0 })
  })

  huSummary = computed(() => {
    const huList = this.detail()?.hu[0].incomeList ?? []
    return huList.reduce(({ accAmount, accInc, accCal }, { actualAmount, calAmount, incomeAmount }) => {
      return { accAmount: accAmount + actualAmount, accInc: accInc + incomeAmount, accCal: calAmount + accCal }
    }, { accAmount: 0, accInc: 0, accCal: 0 })
  })

  summary = computed(() => {
    const dn = this.dnSummary()
    const hu = this.huSummary()
    return {
      accAmount: dn.accAmount + hu.accAmount,
      accCal: dn.accCal + hu.accCal,
      accInc: dn.accInc + hu.accInc
    }
  })

  private readonly detail$ = this.fetch$.pipe(
    switchMap(id => id === null
      ? of(null)
      : this.getDetail(id).pipe(catchError(() => of(null)))
    )
  )

  detail = toSignal(this.detail$, { initialValue: null as TPairDetail | null })
}

const MOCK_HEAD: TContactHead = {
  id: 42,
  displayName: "ABC Pharma DN",
  startDate: "2026-01-01T00:00:00",
  endDate: "2026-12-31T00:00:00",
  period: 12,
  accAmount: 700000,
  accIncome: 0,
  receAmount: 0,
  invAmount: 0,
  orderAmount: 0,
  billAmount: 0,
  creditAmount: 0,
  amountDate: null,
  incomeDate: null,

}

const MOCK_INCOME = {
  id: 2,
  incomeName: "Invoice",
  incomeType: 3
}

const MOCK_EVENT = {
  id: 1,
  eventName: "NOT LIGHT",
  eventType: 1
}

const MOCK_COMP: TOIComp = {
  compCode: "001",
  compName: "ABC Pharma Co.",
  compType: "DN",
  compName2: "",
  compGroupCode: "1"
}

const MOCK_NL = {
  id: 10,
  stepType: 2,
  capAmount: null,
  incVat: false,
  isRebate: false,
  isDc: true,
  isInce: false,
  isComp: false
}

const MOCK_STEP = [
  { id: 1, min: 1_000_000, max: 1_500_000, rate: 1 },
  { id: 2, min: 1_500_000, max: null, rate: 1.5 }
]

const MOCK_PRODUCT = [
  { id: 5, goodCode: "P001", goodName: "Product A", barCode: "8850001", goodStat: "A" }

]

const MOCK_INCOME_LIST = [
  {
    id: 100,
    calAmount: 700000,
    actualAmount: 700000,
    incomeAmount: 0,
    startDate: "2026-01-01T00:00:00",
    endDate: "2026-01-31T00:00:00",
    cn: 0,
    reason: "",
    checkDate: null
  }, {
    id: 101,
    calAmount: 600000,
    actualAmount: 700000,
    incomeAmount: 0,
    startDate: "2026-01-01T00:00:00",
    endDate: "2026-01-31T00:00:00",
    cn: 100000,
    reason: "",
    checkDate: null
  }, {
    id: 103,
    calAmount: 500000,
    actualAmount: 500000,
    incomeAmount: 11000,
    startDate: "2026-01-01T00:00:00",
    endDate: "2026-01-31T00:00:00",
    cn: 0,
    reason: "",
    checkDate: null
  }
]

const MOCK_PERIOD: TPopulatedPeriodResult[] = []

const MOCK: TPairDetail = {
  id: 1,
  displayName: "ABC Pharma DN+HU",
  dn: [
    {
      head: MOCK_HEAD,
      income: MOCK_INCOME,
      event: MOCK_EVENT,
      company: MOCK_COMP,
      notLight: MOCK_NL,
      stepList: MOCK_STEP,
      productList: MOCK_PRODUCT,
      incomeList: MOCK_INCOME_LIST.filter((_, idx) => idx >= 1),
      periodList: MOCK_PERIOD
    }
  ],
  hu: [
    {
      head: MOCK_HEAD,
      income: MOCK_INCOME,
      event: MOCK_EVENT,
      company: { ...MOCK_COMP, compType: "HU", compName: "hu-001" },
      notLight: MOCK_NL,
      stepList: MOCK_STEP,
      productList: MOCK_PRODUCT,
      incomeList: MOCK_INCOME_LIST.filter((_, idx) => idx < 1),
      periodList: MOCK_PERIOD
    }
  ]
}
