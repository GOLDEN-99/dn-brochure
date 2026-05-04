import { InjectionToken } from "@angular/core";
import { TBenefitOption, TBenefitThreshold } from "../../types/crm-promotion.type";
import { TCreatePromotionForm } from "../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema";

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
    initialData: TCreatePromotionForm
}

export const CRM_PAGE_CONFIG = new InjectionToken<ICrmPageConfig>('CRM_PAGE_CONFIG')

export const CRM_BUNDLE_REWARD: TBenefitOption[] = [
    { action: "BUNDLEPRICE", label: "ปรับราคา SET" },
    { action: "BUNDLEBATHDISC", label: "ลดราคา SET เป็นบาท" },
    { action: "BUNDLEPERCENTDISC", label: "ลดราคา SET เป็นเปอร์เซ็นต์" },
    { action: "PWP", label: "สิทธิแลกซื้อ" },
    { action: "GIFT", label: "สินค้าแถม" }
]

export const CRM_INLINE_REWARD: TBenefitOption[] = [
    { action: "ITEMBATHDISC", label: "ลดสินค้าเป็นบาท" },
    { action: "ITEMPERCENTDISC", label: "ลดสินค้าเป็นเปอร์เซ็นต์" },
    { action: "ITEMPRICE", label: "ปรับราคาสินค้า" }
]
