import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { getOrElse } from '../../lib/utli';
import { DateRangeService } from './date-range-service.service';
import { TActiveOrderV2, TAppDoorProp, TAppOrder, TGetIbObRes, TLoginOrder, TTimeSlot } from '../../types/ibob-supplier.type';
import { TExtendedComp } from '../supplier/supplier.token';

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

  changeReservationData = (id: number, req: TPatchReservationReq) => this.api.patch(`${environment.oi}/ib-ob/reservation/${id}`, req)

  searchOrder = ({ compType, compCode }: { compType: string, compCode: string }) =>
    this.api.get<TActiveOrderV2[]>(`${environment.oi}/ib-ob/active-order/${compType}/${compCode}`)
      .pipe(
        getOrElse<TActiveOrderV2[], TActiveOrderV2[]>([])
      )

  searchTimeSlot = (doorId: string, date: string) =>
    this.api.get<TGetIbObRes>(`${environment.ibob}/GetInBound/${doorId}/${date}`)
      .pipe(
        map(({ slots }) => slots),
        getOrElse<TTimeSlot[], TTimeSlot[]>([])
      );

  searchComp = (compType: string, term: string) =>
    this.api.get<TExtendedComp[]>(`${environment.oi}/comp/${compType}`, { params: { term } })
      .pipe(getOrElse<TExtendedComp[], TExtendedComp[]>([])
      )

  changeOrder = (reservationId: number, orderNumb: string, box: number) =>
    this.api.patch(`${environment.oi}/ib-ob/reservation/${reservationId}/${orderNumb}`, { box })

  deleteReservationOrder = (reservationId: number, orderNumb: string) =>
    this.api.delete(`${environment.oi}/ib-ob/reservation/${reservationId}/${orderNumb}`)
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

type TPatchReservationReq = {
  reservationDate?: string
  reservationTime?: string
  doorId?: string
  contactName?: string
  phoneNumber?: string
  truckType?: string
  truckLicensePlate?: string
}