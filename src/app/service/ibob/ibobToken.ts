import { InjectionToken, Signal } from "@angular/core"
import { Observable } from "rxjs"
import { TLoginReq, TLoginRes } from "../../types/ibob-supplier.type"
import { TDate } from "../../lib"

export interface IIbObLogin {
    login: (req: TLoginReq) => Observable<TLoginRes>
}

export interface IIbObComp {
    compList: Signal<any>
}

export interface IIbObReserve {
    changeGate: (gate: string) => void
    changeDate: (date: TDate) => void
    possibleSlot: Signal<string[]>
    createReserve: (...arg: any[]) => any
}

export const LOGINABLE_TOKEN = new InjectionToken<IIbObLogin>('ibob_login')
export const IBOBCOMPLIST_TOKEN = new InjectionToken<IIbObComp>('ibob_complist_token')
export const IBOBRESERVE_TOKEN = new InjectionToken<IIbObReserve>('ibob_reserve_token')