import { InjectionToken } from "@angular/core";
import { TBenefitOption, TBenefitThreshold } from "../../types/crm-promotion.type";
import { TCreatePromotionForm } from "../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema";
import { CHEAPEST_ACTION, REGISTER_FEE_ACTION } from "../../lib/crm-promotion/promotion-actions";

interface IFilterOption {
    showFilter: boolean
    showList: boolean
    showBundle: boolean
    showItem: boolean
}

interface IRewardOption {
    rewardList: TBenefitOption[]
    thresholdList: TBenefitThreshold[]
    // Single-purpose create pages (ค่าสมาชิก, แถมในกลุ่ม) pin the action and hide the
    // ladder controls, leaving the user exactly one number to fill in. The two
    // show* flags say which number that is; both default to true, so the general
    // pages need not declare any of this.
    fixedAction?: boolean
    showThresholdInput?: boolean
    showRewardInput?: boolean
}


export interface ICrmPageConfig {
    pageName: string
    filterOption: IFilterOption
    rewardOption: IRewardOption
    initialData: TCreatePromotionForm
}

export const CRM_PAGE_CONFIG = new InjectionToken<ICrmPageConfig>('CRM_PAGE_CONFIG')

// Shared by the create-bill page and the edit page's BILL case, which previously kept
// two copies of the same table and had to be updated in lockstep.
export const CRM_BILL_REWARD: TBenefitOption[] = [
    { action: "BILLBATHDISC", label: "ลดทั้งบิลเป็นบาท" },
    { action: "BILLPERCENTDISC", label: "ลดทั้งบิลเป็นเปอร์เซ็นต์" },
    { action: "PWP", label: "สิทธิแลกซื้อ" },
    { action: "GIFT", label: "สินค้าแถม" },
    { action: REGISTER_FEE_ACTION, label: "ฟรีค่าสมัครสมาชิก" },
]

export const CRM_BUNDLE_REWARD: TBenefitOption[] = [
    { action: "BUNDLEPRICE", label: "ปรับราคา SET" },
    { action: "BUNDLEBATHDISC", label: "ลดราคา SET เป็นบาท" },
    { action: "BUNDLEPERCENTDISC", label: "ลดราคา SET เป็นเปอร์เซ็นต์" },
    { action: "PWP", label: "สิทธิแลกซื้อ" },
    { action: "GIFT", label: "สินค้าแถม" },
    { action: CHEAPEST_ACTION, label: "แถมสินค้าถูกสุด(ชิ้น)" },
]

export const CRM_INLINE_REWARD: TBenefitOption[] = [
    { action: "ITEMBATHDISC", label: "ลดสินค้าเป็นบาท" },
    { action: "ITEMPERCENTDISC", label: "ลดสินค้าเป็นเปอร์เซ็นต์" },
    { action: "ITEMPRICE", label: "ปรับราคาสินค้า" }
]
