import { InjectionToken, Signal } from "@angular/core"
import { TSupplierItem } from "../../types"
import { ICompBase } from "../../types/ibob-supplier.type"

export interface ISupplierList {
    pageLabel: Signal<'DN' | 'HU'>
    searchCompCode: (value: any) => void
    compBase: Signal<ICompBase | null>
    product: Signal<any[]>
}

export const SUPPLIER_TOKEN = new InjectionToken<ISupplierList>('supplier_token')