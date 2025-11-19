import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { IIbObLogin, IIbObReserve } from './ibobToken';
import { TAppOrder, TAppOrderState, TCreateReservationReq, TEditableResavation, TFormattedLoginResponse, TGetIbObRes, TLoginReq, TLoginRes, TModifiedComp, TTimeSlot } from '../../types/ibob-supplier.type';
import { convertToIso } from '../../lib';
import { TMaybe } from '../../types';
import { LocalService, TAuthStorageKey } from '../local/local.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { IbobQueryReservationService } from './ibob-query-reservation.service';
import { DateRangeService } from './date-range-service.service';

@Injectable({
  providedIn: 'root'
})
export class IbobAddService implements IIbObLogin, IIbObReserve {

  constructor() { }

  private api = inject(ApiService)
  private baseurl = environment.ibob
  private storage = inject(LocalService)
  private token = ''

  private mockComp = {
    compCode: 'test code',
    saleName: 'contactName',
    compName: 'test name',
    compEmail: 'test@email.com',
    compName2: 'thai comp?',
    compPhone: '0999999999',
    shipto: 'anywhere'
  }

  currentComp = signal<TMaybe<TModifiedComp>>(null)
  orderState = signal<TAppOrderState>({}) // mocking data
  orderList: Signal<TAppOrder[]> = computed(() => Object.entries(this.orderState()).map(([k, v]) => ({ orderNumb: k, box: v, check: true, orderDate: '2025-11-19' })))
  checkOrder = (orderId: string) => this.orderState.update(prev => ({ ...prev, [orderId]: (prev[orderId] ?? 0) + 1 }))

  changeOrderAmount = (orderId: string) => (box: number) => this.orderState.update(prev => ({ ...prev, [orderId]: box }))

  deleteOrder = (orderId: string) => this.orderState.update(prev => {
    const { [orderId]: _, ...rest } = prev
    return rest
  })

  saveLogin = (user: TAuthStorageKey, { comp, token, order }: TFormattedLoginResponse) => {
    this.storage.setLoginResponse(user)({ comp, token, order })
  }

  setAppState = ({ comp, order, token }: TFormattedLoginResponse) => {
    this.currentComp.set(comp)
    //this.orderList.set(order.map(o => ({ ...o, check: false, box: 0 })))
    this.token = token
  }

  private formatLoginRespose = ({ comp, shipto, ...res }: TLoginRes): TFormattedLoginResponse => ({
    comp: { ...comp, shipto },
    ...res
  })

  login(req: TLoginReq) {
    return this.api.post<TLoginRes>(`${this.baseurl}/compSingIn`, req)
      .pipe(
        map(res => this.formatLoginRespose(res)),
      )
  }


  createReservation(formData: TEditableResavation) {
    const currentCompData = this.currentComp()
    if (!currentCompData) throw new Error('please login')
    const orderList = this.orderList()
    const order = orderList.map(({ orderNumb, box }) => ({ orderNumb, box }))
    const reqBody: TCreateReservationReq = {
      companyName: currentCompData.compName,
      compCode: currentCompData.compCode,
      email: currentCompData.compEmail,
      shipto: currentCompData.shipto,
      order,
      ...formData
    }
    const headers = this.api.createJWTHeader(this.token)
    return this.api.post(`${this.baseurl}/CreateReservation`, reqBody, { ...headers })
  }

  adminCreateReservation = (req: TCreateReservationReq, withHeader: boolean = false) => {
    if (withHeader) {
      const headers = this.api.createJWTHeader(this.token)
      return this.api.post(`${this.baseurl}/CreateReservation`, req, { ...headers })
    }

    return this.api.post(`${this.baseurl}/CreateReservation`, req)
  }

  gate = signal<TMaybe<string>>(null)
  private gate$ = toObservable(this.gate).pipe(filter(g => g !== null))
  private cal = inject(NgbCalendar)
  private today = this.cal.getToday()
  selectDate = signal(this.today)
  private isoSelectDate = computed(() => convertToIso(this.selectDate()))
  private selectDate$ = toObservable(this.isoSelectDate)
  private params$ = combineLatest([this.gate$, this.selectDate$])
  private getTimeSlot = (gate: string, iso: string) => this.api
    .get<TGetIbObRes>(`${this.baseurl}/GetInBound/${gate}/${iso}`)
    .pipe(
      map(({ slots }) => slots),
      catchError((err) => { console.log(err); return of([] as TTimeSlot[]); })
    )

  private posibleSlot$ = this.params$
    .pipe(
      switchMap(([gate, date]) => this.getTimeSlot(gate, date)),
      tap(console.log)
    )
  possibleSlot = toSignal(this.posibleSlot$, { initialValue: [] })

  isLogin = () => {
    const isLogin = this.currentComp() !== null || this.token !== ''
    return isLogin
  }

  loadCompData = (compType: string | null, compCode: string | null) => {
    if (compCode === null || compType === null) return
    const data = this.storage.getLoginResponse({ compType, user: compCode })()
    if (!data) return
    const { comp, order, token } = data
    this.currentComp.set(comp)
    //this.orderList.set(order.map((o) => ({ ...o, check: false, box: 0 })))
    this.token = token
  }
  private compParam$ = toObservable(this.currentComp).pipe(
    filter(c => c !== null),
    map(({ compCode, shipto }) => ({ compCode, compType: shipto }))
  )
  private dateRangeService = inject(DateRangeService)
  fromDate = this.dateRangeService.fromDate
  toDate = this.dateRangeService.toDate
  private dateRange$ = this.dateRangeService.dateRange$
  private qParams$ = combineLatest([this.dateRange$, this.compParam$]).pipe(map(([range, comp]) => ({ ...range, ...comp })))

  private reservationService = inject(IbobQueryReservationService)

  private reservationList$ = this.qParams$.pipe(
    switchMap((q) => this.reservationService.getManyReservation(q)),
  )
  reservationList = toSignal(this.reservationList$, { initialValue: [] })

}


type TQueryReservation = {
  compType: string
  compCode: string
  fromDate: string
  toDate: string
}

type TReservationItem = {
  orderNumb: string
  box: number
}

type TReservationDetail = {
  id: number
  reservationDate: string
  reservationTime: string
  companyName: string
  compCode: string
  shipTo: string
  contactName: string
  phoneNumber: string
  email: string
  truckType: string
  truckLicensePlate: string
  note: string
  doorId: number
  doorName: string
  warehouseId: number
  warehouseName: string
  location: string
}

type TReservationRes = {
  reservation: TReservationDetail
  orderList: TReservationItem[]
}

type TFlatenReservation = {
  total: number
  orderList: TReservationItem[]
} & TReservationDetail