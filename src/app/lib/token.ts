import { InjectionToken, Signal } from "@angular/core"
import { TBorchureHead, TColor, TGroupItemList, TMaybe } from "../types"

export interface IBrochureService {
    head: Signal<TMaybe<TBorchureHead>>
    content: Signal<TGroupItemList>
    maxItem: Signal<8 | 12>
    totalPage: Signal<number[]>
    color: Signal<TColor>
}

export const BROCHURE_TOKEN = new InjectionToken<IBrochureService>('brochure')