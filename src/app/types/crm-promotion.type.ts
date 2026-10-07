import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap"

export type TPromotionBranch = {
    // branch lock
    isBranchSpecific: boolean
    branches: TBranch[]
}

export type TPromotionMember = {
    // member lock
    isMemberSpecific: boolean
    members: TMember[]
}

export type TTimeSpan = {
    startTime: NgbTimeStruct
    endTime: NgbTimeStruct
}

export type TPromotionDatetime = {
    // dow lock
    activeDay: [boolean, boolean, boolean, boolean, boolean, boolean, boolean], // 1111111
    // time of day lock
    limitTime: boolean
    // startTime: NgbTimeStruct
    // endTime: NgbTimeStruct
    timeSpan: TTimeSpan
}

export type TPromotionMaster = {
    promotionName: string,
    promotionDesc: string,
    promotionType: string,
    source: string,
    // promotion lock
    //promotionStatus: "ACTIVE",
    dateRange: {
        startDate: NgbDateStruct
        endDate: NgbDateStruct
    }
    promotionPriority: string
    promotionOrder: string
}

export type TPromotionTier = {
    thresholdValue: number
    rewardValue: number
}

export type TPromotionBenefit = {
    action: string
    thresholdType: string
    isRepeat: boolean
    tiers: TPromotionTier[]
    rewardPool: TProductRewardPool[]
}

export type TBenefitOption = {
    action: string
    label: string
}

export type TBenefitThreshold = {
    threshold: string
    label: string
}

export type TPromotionFormState = {
    filterList: TPromotionFilterState[]
} & TPromotionBenefit & TPromotionMaster & TPromotionBranch & TPromotionMember & TPromotionDatetime

export type TBranch = {
    branchCode: string
    branchName: string
}
// A product is the pair (goodCode, unitCode) -- lib/crm-promotion/product-key.ts. The unit fields
// are optional-nullable: the API returns them on every row (null on a row not yet backfilled),
// older fixtures and a REGISTERFEE pool derived at submit may omit them. Display only beyond
// unitCode: unitDesc / unitFactor from UnitInfo, barcode = the unit's own scan code (what a pack
// unit has instead of the 6-digit sku).
export type TPromotionProductBase = {
    goodCode: string
    goodName: string
    sku: string
    unitCode?: string | null
    unitDesc?: string | null
    unitFactor?: number | null
    barcode?: string | null
}

export type TProductRewardPool = {
    itemBenefitType: string
    itemBenefitValue: number
} & TPromotionProductBase

export type TFilterProduct = {
    op: string
    products: TPromotionProductBase[]
}

// for fix bundle +/- count per group
export type TProductPool = {
    poolGroup: number
} & TPromotionProductBase

export type TPWPPool = {
    pwpPrice: number
} & TPromotionProductBase

export type TInlinePool = {
    benefitBath: number,
    benefitPercent: number,
    benefitPrice: number,
    pwpCount: number,
} & TPromotionProductBase

export type TDayState = [boolean, boolean, boolean, boolean, boolean, boolean, boolean]


export type TPromotionVariationConfig = Pick<TPromotionFormState, 'promotionType' | 'action' | 'thresholdType' | 'isRepeat' | 'filterList' | 'tiers'>

export type TBranchDetail = {
    id: number
    branchCode: string
    branchName: string
    branchGroupCode: string
    branchGroupDesc: string
    branchZoneCode: string
    branchZoneDesc: string
    wholePrice: string
    allowWholePrice: string
    branchPrice: string
    allowOnlinePrice: string
    onlinePrice: string
    allowOnlyMembPrice: string
    competitivePrice: string
    competitivePriceA: string
    competitivePriceB: string
    competitivePriceC: string
    allowCheckCostAndPrice: string
}

export type TConfigGroup = {
    id: number
    name: string
}

export type TBranchZoneDetail = {
    branchZoneCode: string,
    branchZoneDesc: string
}

export type TBranchGroupDetail = {
    branchGroupCode: string,
    branchGroupDesc: string
}

export type TMember = {
    id: number
    memberName: string
    custType: string
}

// GET /crm/all-products: one row per (good, unit, supplier) from the GoodBarcode base tier
// (goodAmou = 1). A good sold as strip and box is two rows; the author picks the one meant.
export type TProductDetail = {
    id: number
    goodCode: string
    sku: string
    compCode: string
    goodName: string
    compName: string
    compName2: string | null
    cateCode: string
    cateDesc: string
    typeCode: string
    typeDesc: string
    goodGroupCode: string
    goodGroupDesc: string
    unitCode: string | null
    unitDesc: string | null
    unitFactor: number | null
    barcode: string | null
    /** The unit's own price1, so a ฿0 (dead) row is visible in the picker. */
    price1: number | null
}

export type TProductCate = {
    cateCode: string
    cateDesc: string

}
export type TProductType = {
    typeCode: string
    typeDesc: string
}

export type TProductGroup = {
    groupCode: string
    groupDesc: string
}

export type TPromotionFilterBase = {
    filterType: string
    filterValue: number
}

export type TPromotionFilterForm = {
    productList: Record<string, TPromotionProductBase>
} & TPromotionFilterBase

export type TPromotionFilterState = {
    productList: TPromotionProductBase[]
} & TPromotionFilterBase

type TCreatePromotionRewardPool = {
    goodCode: string
    unitCode: string | null
    itemBenefitType: string
    itemBenefitValue: number
}

// `products` is what the API stores (the pairs); `productList` (bare good codes) is the pre-unit
// shape, still sent so an API one release behind keeps working. When both arrive, products wins.
type TCreatePromotionFilter = {
    productList: string[]
    products: { goodCode: string; unitCode: string | null }[]
} & TPromotionFilterBase

export type TPromotionListItem = {
    id: number
    promotionName: string
    promotionType: string
    // null on every promotion stored since 2026-05-13 — the API never writes it
    source: string | null
    action: string
    thresholdType: string
    isRepeat: boolean
    promotionStatus: string
    startdate: string
    enddate: string
    promotionPriority: number
    promotionOrder: number
}

// GET /crm/promotions?include=details: the detail shape with the branch list reduced to a count,
// which is all a list row shows (branch lists were ~60% of the payload; CRM-PROMOTIONS.md §7b)
export type TPromotionListDetail = Omit<TPromotionDetail, 'branches'> & { branchCount: number }

export type TPromotionDetail = {
    id: number
    promotionName: string
    promotionDesc: string
    promotionType: string
    // null on every promotion stored since 2026-05-13 — the API never writes it
    source: string | null
    action: string
    thresholdType: string
    isRepeat: boolean
    isBranchSpecific: boolean
    isMemberSpecific: boolean
    startdate: string
    enddate: string
    limitTime: boolean
    startTime: string
    endTime: string
    activeDays: string
    promotionStatus: string
    promotionPriority: number
    promotionOrder: number
    tiers: TPromotionTier[]
    filterList: {
        filterType: string
        filterValue: number
        productList: TPromotionProductBase[]
    }[]
    rewardPool: TProductRewardPool[]
    branches: TBranch[]
    members: TMember[]
}

export type TCreatePromotionRequest = {
    promotionName: string
    promotionDesc: string
    promotionType: string
    source: string
    promotionOrder: number
    promotionPriority: number
    startDate: string
    endDate: string
    isBranchSpecific: boolean
    branches: string[]
    isMemberSpecific: boolean
    members: number[]
    limitTime: boolean
    startTime: string
    endTime: string
    activeDay: string
    filterList: TCreatePromotionFilter[]
    action: string
    thresholdType: string
    isRepeat: boolean
    tiers: TPromotionTier[]
    rewardPool: TCreatePromotionRewardPool[]
}