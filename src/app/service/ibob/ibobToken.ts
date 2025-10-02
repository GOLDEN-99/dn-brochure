import { InjectionToken, Signal, WritableSignal } from "@angular/core"
import { Observable } from "rxjs"
import { TAppOrder, TComp, TCreateReservationReq, TDoor, TDoorMap, TEditableResavation, TFormattedLoginResponse, TLoginReq, TLoginRes, TModifiedComp, TTimeSlot, TWarehouse } from "../../types/ibob-supplier.type"
import { TDate } from "../../lib"
import { TMaybe } from "../../types"
import { NgbDate } from "@ng-bootstrap/ng-bootstrap"

export interface IIbObLogin {
    login: (req: TLoginReq) => Observable<TFormattedLoginResponse>
}

export interface IIbObComp {
    warehouseList: Signal<TWarehouse[]>
}

interface IIbObFormState {
    currentComp: Signal<TMaybe<TModifiedComp>>
    orderList: Signal<TAppOrder[]>
    checkOrder: (orderId: string) => void
    changeOrderAmount: (orderId: string) => (box: number) => void
}

export interface IIbObReserve extends IIbObFormState {
    gate: WritableSignal<TMaybe<string>>
    selectDate: WritableSignal<NgbDate>
    possibleSlot: Signal<TTimeSlot[]>
    createReservation: (req: TEditableResavation) => Observable<any>
}

export const LOGINABLE_TOKEN = new InjectionToken<IIbObLogin>('ibob_login')
export const IBOBCOMPLIST_TOKEN = new InjectionToken<IIbObComp>('ibob_complist_token')
export const IBOBRESERVE_TOKEN = new InjectionToken<IIbObReserve>('ibob_reserve_token')
