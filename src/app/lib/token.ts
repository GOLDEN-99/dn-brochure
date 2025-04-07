import { InjectionToken, Signal } from "@angular/core"
import { TBorchureHead, TColor, TDropdownProps, TGroupItemList, TMaybe } from "../types"
import { FormGroup } from "@angular/forms"


export interface IBrochureService {
    head: Signal<TMaybe<TBorchureHead>>
    content: Signal<TGroupItemList>
    maxItem: Signal<8 | 12>
    totalPage: Signal<number[]>
    color: Signal<TColor>
}

export const BROCHURE_TOKEN = new InjectionToken<IBrochureService>('brochure')

export const DROPDOWN_TOKEN = new InjectionToken<TDropdownProps<number>[]>('dropdown_props')
