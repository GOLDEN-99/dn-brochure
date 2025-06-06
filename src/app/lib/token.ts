import { InjectionToken, Signal } from "@angular/core"
import { TBorchureHead, TColor, TDropdownProps, TGroupItemList, TMaybe, TPrice, TSupplierItem } from "../types"


export interface IBrochureService {
    head: Signal<TMaybe<TBorchureHead>>
    content: Signal<TGroupItemList>
    maxItem: Signal<8 | 12>
    totalPage: Signal<number[]>
    color: Signal<TColor>
}
export interface ISupplierList {
    data: Signal<TSupplierItem[]>
    pageLabel: Signal<'DN' | 'HU'>
}

export const BROCHURE_TOKEN = new InjectionToken<IBrochureService>('brochure')

export const DROPDOWN_TOKEN = new InjectionToken<TDropdownProps<number>[]>('dropdown_props')

export const SUPPLIER_TOKEN = new InjectionToken<ISupplierList>('supplier_token')

export interface IBrochurePriceType { priceType: keyof TPrice }

export const BROCHURE_PRICE_TYPE_TOKEN = new InjectionToken<IBrochurePriceType>('brochure_price_type')