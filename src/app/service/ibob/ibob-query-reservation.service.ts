import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { getOrElse } from '../../lib/utli';
import { DateRangeService } from './date-range-service.service';
import { TAppDoorProp } from '../../types/ibob-supplier.type';

@Injectable({
  providedIn: 'root',
})
export class IbobQueryReservationService {

  constructor() { }

  private api = inject(ApiService)

  getManyReservation = (params: TQueryReservation) => this.api
    .get<TReservationRes[]>(`${environment.oi}/ib-ob/reservation/`, { params })
    .pipe(
      map((res) => res.map(reserve => this.flatenReservationFn(reserve))),
      getOrElse<TFlatenReservation[], TFlatenReservation[]>([])
    )

  private flatenReservationFn = ({ reservation, orderList }: TReservationRes) => ({
    ...reservation, orderList, total: orderList.reduce((acc, cur) => acc + cur.box, 0)
  })

  getSingleReservation = (reservationId: string) => this.api
    .get<TSingleReservation>(`${environment.oi}/ib-ob/reservation/${reservationId}`)
    .pipe(
      getOrElse(null)
    )

  deleteReservation = (reservationId: number) => this.api.delete(`${environment.oi}/ib-ob/reservation/${reservationId}`)

}

export type TQueryReservation = {
  warehouse?: number
  compType?: string
  compCode?: string
  compName?: string
  order?: string
  fromDate?: string
  toDate?: string
}

export type TReservationItem = {
  orderNumb: string
  box: number
}

export type TReservationDetail = {
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

export type TReservationRes = {
  reservation: TReservationDetail
  orderList: TReservationItem[]
}

export type TFlatenReservation = {
  total: number
  orderList: TReservationItem[]
} & TReservationDetail

export type TSingleReservation = {
  activeDoor: TAppDoorProp
  orderList: TReservationItem[]
  slots: string[]
  compEmail: string
  compPhone: string
} & TReservationDetail