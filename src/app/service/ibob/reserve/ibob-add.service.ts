import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { environment } from '../../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, Subject, switchMap, tap } from 'rxjs';
import { IIbObComp, IIbObLogin, IIbObReserve } from '../ibobToken';
import { TAppOrder, TComp, TCreateReservationReq, TDoor, TEditableResavation, TGetIbObRes, TLoginReq, TLoginRes, TModifiedComp, TTimeSlot, TWarehouse } from '../../../types/ibob-supplier.type';
import { TDate } from '../../../lib';
import { TMaybe } from '../../../types';
import { LocalService } from '../../local/local.service';

@Injectable({
  providedIn: 'root'
})
export class IbobAddService implements IIbObLogin, IIbObReserve {

  constructor() { }

  private api = inject(ApiService)
  private baseurl = environment.ibob
  private storage = inject(LocalService)

  currentComp = signal<TMaybe<TModifiedComp>>({
    compCode: 'test code',
    saleName: 'contactName',
    compName: 'test name',
    compEmail: 'test@email.com',
    compName2: 'thai comp?',
    compPhone: '0999999999',
    shipto: 'anywhere'
  })
  orderList = signal<TAppOrder[]>([{ orderDate: '2025-01-01', orderNumb: 'PO12345', check: false, box: 0 }]) // mocking data
  checkOrder = (orderId: string) => this.orderList.update((prev) => prev.map((or) =>
    or.orderNumb === orderId
      ? ({ ...or, check: !or.check, box: or.check ? 0 : or.box })
      : or)
  )
  changeOrderAmount = (orderId: string) => (box: number) => this.orderList.update(prev => prev.map(or =>
    or.orderNumb === orderId && or.check ?
      ({ ...or, box })
      : or
  ))


  private loginHandler = ({ comp, door, shipto, token, order }: TLoginRes) => {
    this.currentComp.set({ ...comp, shipto })
    this.storage.saveToken(token)
    this.orderList.update(() => order.map(or => ({ ...or, check: false, box: 0 })))
  }

  login(req: TLoginReq) {
    return this.api.post<TLoginRes>(`${this.baseurl}/compSingIn`, req)
      .pipe(tap(this.loginHandler))
  }


  createReservation({ doorId, note, reservationDate, reservationTime }: TEditableResavation) {
    const currentCompData = this.currentComp()
    if (!currentCompData) throw new Error('please login')
    const reqBody: TCreateReservationReq = {
      companyName: currentCompData.compName,
      compCode: currentCompData.compCode,
      contactName: currentCompData.saleName,
      phoneNumber: currentCompData.compPhone,
      email: currentCompData.compEmail,
      shipto: currentCompData.shipto,
      note,
      doorId,
      reservationDate,
      reservationTime,
      truckType: "???",
      truckLicensePlate: "???",
      order: this.orderList().map(({ orderNumb, box }) => ({ orderNumb, box }))
    }
    return this.api.post(`${this.baseurl}/CreateReservation`, reqBody)
  }

  private gate$ = new Subject<string>()
  private selectDate$ = new Subject<string>()
  private params$ = combineLatest([this.gate$, this.selectDate$])
  private getTimeSlot = (gate: string, iso: string) => this.api
    .get<TGetIbObRes>(`${this.baseurl}/GetInBound/${gate}/${iso}`)
    .pipe(
      map(({ slots }) => slots),
      catchError((err) => { console.log(err); return of([] as TTimeSlot[]); })
    )

  changeGate(gate: string) {
    this.gate$.next(gate)
  }
  changeDate({ day, month, year }: TDate) {
    const isoDate = `${year}-${month}-${day}`
    this.selectDate$.next(isoDate)
  }
  private posibleSlot$ = this.params$
    .pipe(
      switchMap(([gate, date]) => this.getTimeSlot(gate, date)),
      tap(console.log)
    )
  possibleSlot = toSignal(this.posibleSlot$, { initialValue: [] })
}

