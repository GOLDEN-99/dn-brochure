import { InjectionToken, Signal, WritableSignal } from "@angular/core"
import { TSupplierItem } from "../../types"
import { ICompBase } from "../../types/ibob-supplier.type"
import { TOIComp } from "../other-income/company.service"

export interface ISupplierList {
    pageLabel: Signal<'DN' | 'HU'>
    compCode: WritableSignal<string>
    term: WritableSignal<string>
    compList: Signal<TExtendedComp[]>
    searchCompCode: (value: any) => void
    compBase: Signal<ICompBase | null>
    product: Signal<any[]>
}

export const SUPPLIER_TOKEN = new InjectionToken<ISupplierList>('supplier_token')

export type TExtendedComp = {
    compAddr: string
    compPhone: string
    compEmail: string
    username: string
    userpass: string
} & TOIComp