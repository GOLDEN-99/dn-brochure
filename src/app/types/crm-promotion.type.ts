import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap"

type TPromotionBrnach = {
    // branch lock
    isBranchSpecific: boolean
    branches: TBranch[]
}

type TPromotionMember = {
    // member lock
    isMemberSpecific: boolean
    members: TMember[]
}

type TPromotionDatetime = {
    // dow lock
    activeDay: [boolean, boolean, boolean, boolean, boolean, boolean, boolean], // 1111111
    // time of day lock
    limitTime: boolean
    startTime: NgbTimeStruct
    endTime: NgbTimeStruct
}

type TPromotionMaster = {
    promotionName: string,
    promotionDesc: string,
    promotionType: string,
    source: string,
    // promotion lock
    //promotionStatus: "ACTIVE",
    startDate: NgbDateStruct
    endDate: NgbDateStruct
    promotionPriority: number
    promotionOrder: number
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
} & TPromotionBenefit & TPromotionMaster & TPromotionBrnach & TPromotionMember & TPromotionDatetime

export type TBranch = {
    branchCode: string
    branchName: string
}
export type TPromotionProductBase = {
    goodCode: string
    goodName: string
    sku: string
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

export type TProductDetail = {
    goodCode: string
    sku: string
    compCode: string
    goodName: string
    compName: string
    compName2: string
    cateCode: string
    cateDesc: string
    typeCode: string
    typeDesc: string
    groupCode: string
    groupDesc: string
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
    itemBenefitType: string
    itemBenefitValue: number
}

type TCreatePromotionFilter = {
    productList: string[]
} & TPromotionFilterBase

export type TPromotionListItem = {
    id: number
    promotionName: string
    promotionType: string
    action: string
    thresholdType: string
    isRepeat: boolean
    promotionStatus: string
    startdate: string
    enddate: string
    promotionPriority: number
    promotionOrder: number
}

export type TPromotionDetail = {
    id: number
    promotionName: string
    promotionDesc: string
    promotionType: string
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