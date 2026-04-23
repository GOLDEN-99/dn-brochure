import { InjectionToken } from "@angular/core";
import { TBenefitOption, TBenefitThreshold, TPromotionFormState, TPromotionVariationConfig } from "../../types/crm-promotion.type";

interface IFilterOption {
    showFilter: boolean
    showList: boolean
    showBundle: boolean
    showItem: boolean
}

interface IRewardOption {
    rewardList: TBenefitOption[]
    thresholdList: TBenefitThreshold[]
}


export interface ICrmPageConfig {
    pageName: string
    filterOption: IFilterOption
    rewardOption: IRewardOption
    initialData: Omit<TPromotionFormState, 'startDate' | 'endDate'>
}


export const CRM_PAGE_CONFIG = new InjectionToken<ICrmPageConfig>('CRM_PAGE_CONFIG')

export const DEFAULT_CRM_DATA: Omit<TPromotionFormState, 'startDate' | 'endDate' | 'thresholdType' | 'benefitType' | 'promotionType' | 'action' | 'isRepeat' | 'filterList' | 'tiers'> = {
    promotionName: "",
    promotionDesc: "",


    source: "HU",
    promotionOrder: 0,

    // together
    isMemberSpecific: false,
    members: [],
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
    //benefit
    rewardPool: [],
}

export const CRM_BILL_VARIATION: TPromotionVariationConfig = {
    promotionType: "BILL",
    filterList: [],
    action: 'BILLBATHDISC',
    thresholdType: 'BILLSUBTOTAL',
    isRepeat: false,
    tiers: [{ thresholdValue: 0, rewardValue: 0 }]
}

export const CRM_BUNDLE_VARIATION: TPromotionVariationConfig = {
    promotionType: "BUNDLE",
    filterList: [],
    action: 'BUNDLEBATHDISC',
    thresholdType: 'BUNDLECOUNT',
    isRepeat: true,
    tiers: [{ thresholdValue: 1, rewardValue: 0 }]
}

export const CRM_BUNDLE_REWARD: TBenefitOption[] = [
    { action: "BUNDLEPRICE", label: "ปรับราคา SET" },
    { action: "BUNDLEBATHDISC", label: "ลดราคา SET เป็นบาท" },
    { action: "BUNDLEPERCENTDISC", label: "ลดราคา SET เป็นเปอร์เซ็นต์" },
    { action: "PWP", label: "สิทธิแลกซื้อ" },
    { action: "GIFT", label: "สินค้าแถม" }
]

export const CRM_INLINE_VARIATION: TPromotionVariationConfig = {
    promotionType: "ITEM",
    filterList: [{ filterType: 'EXIST', filterValue: 0, productList: [] }],
    action: 'ITEMPERCENTDISC',
    thresholdType: 'ITEMEXIST',
    isRepeat: true,
    tiers: [{ thresholdValue: 0, rewardValue: 0 }]
}

export const CRM_INLINE_REWARD: TBenefitOption[] = [
    { action: "ITEMBATHDISC", label: "ลดสินค้าเป็นบาท" },
    { action: "ITEMPERCENTDISC", label: "ลดสินค้าเป็นเปอร์เซ็นต์" },
    { action: "ITEMPRICE", label: "ปรับราคาสินค้า" }
]
