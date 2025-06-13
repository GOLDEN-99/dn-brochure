import { InjectionToken, Signal } from "@angular/core"
import { TSupplierItem } from "../../types"

export interface ISupplierList {
    data: Signal<TSupplierItem[]>
    pageLabel: Signal<'DN' | 'HU'>
}

export const SUPPLIER_TOKEN = new InjectionToken<ISupplierList>('supplier_token')