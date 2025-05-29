import { InjectionToken, Signal } from "@angular/core"
import { Observable } from "rxjs"
import { TAppOrder, TComp, TCreateReservationReq, TDoor, TDoorMap, TEditableResavation, TLoginReq, TLoginRes, TModifiedComp, TTimeSlot, TWarehouse } from "../../types/ibob-supplier.type"
import { TDate } from "../../lib"
import { TMaybe } from "../../types"

export interface IIbObLogin {
    login: (req: TLoginReq) => Observable<TLoginRes>
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
<<<<<<< HEAD
=======
    // //display data
    // getCurrentWarehouse: (warehouseId: string) => string
    //api call method
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
    changeGate: (gate: string) => void
    changeDate: (date: TDate) => void
    possibleSlot: Signal<TTimeSlot[]>
    createReservation: (req: TEditableResavation) => Observable<any>
}

export const LOGINABLE_TOKEN = new InjectionToken<IIbObLogin>('ibob_login')
export const IBOBCOMPLIST_TOKEN = new InjectionToken<IIbObComp>('ibob_complist_token')
export const IBOBRESERVE_TOKEN = new InjectionToken<IIbObReserve>('ibob_reserve_token')