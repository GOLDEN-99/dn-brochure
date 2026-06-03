import { InjectionToken } from "@angular/core"
import { TPrice } from "../types/brochure.type"

export interface IBrochurePageToken {
    priceType: keyof TPrice
    pageSize: 8 | 12
}
export const BROCHURE_PAGE_TOKEN = new InjectionToken<IBrochurePageToken>('BROCHURE_PAGE_TOKEN')