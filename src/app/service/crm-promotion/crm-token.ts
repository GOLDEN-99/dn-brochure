import { InjectionToken } from "@angular/core";
import { TPromotionFormState, TPromotionVariationCongif } from "../../types/crm-promotion.type";

export interface ICrmPageCongif {
    pageName: string
    initialData: Omit<TPromotionFormState, 'startDate' | 'endDate'>
}

export const CRM_PAGE_CONFIG = new InjectionToken<ICrmPageCongif>('CRM_PAGE_CONFIG')

export const DEFAULT_CRM_DATA: Omit<TPromotionFormState, 'startDate' | 'endDate' | 'thresholdType' | 'benefitType' | 'promotionType'> = {
    promotionName: "",
    promotionDesc: "",


    //promotionType: "1", // can fix per route
    //thresholdType: "BATH",
    //benefitType: "BATH",
    promotionBenefit: [],
    pwpPool: [],
    inlinePool: [],

    source: "HU",
    promotionOrder: 0,

    // together
    isMemberSpecific: false,
    members: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
    ],
    //together
    isBranchSpecific: false,
    branches: [],
    // map 1111111 -> bool,bool,bool,bool,bool,bool,bool
    activeDay: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
    ],
    promotionPriority: 0,
    // together
    limitTime: false,
    startTime: { hour: 10, minute: 0, second: 0 },
    endTime: { hour: 22, minute: 0, second: 0 },
}

export const CRM_BILL_VARIATION: TPromotionVariationCongif = {
    promotionType: "1",
    thresholdType: "BATH",
    benefitType: "BATH",
}

export const CRM_CATEGORY_VARIATION: TPromotionVariationCongif = {
    promotionType: "2",
    thresholdType: "BATH",
    benefitType: "BATH",
}

export const CRM_FIX_BUNDLE_VARIATION: TPromotionVariationCongif = {
    promotionType: "3",
    thresholdType: "COUNT",
    benefitType: "PRICE",
}

export const CRM_PICK_BUNDLE_VARIATION: TPromotionVariationCongif = {
    promotionType: "4",
    thresholdType: "COUNT",
    benefitType: "PRICE",
}

export const CRM_PWP_VARIATION: TPromotionVariationCongif = {
    promotionType: "5",
    thresholdType: "BATH",
    benefitType: "PRICE",
}

export const CRM_INLINE_VARIATION: TPromotionVariationCongif = {
    promotionType: "6",
    thresholdType: "EXIST",
    benefitType: "BATH"
}