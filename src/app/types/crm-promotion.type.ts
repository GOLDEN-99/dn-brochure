import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap"

export type TPromotionFormState = {
    promotionName: string,
    promotionDesc: string,
    promotionType: string,
    source: string,
    thresholdType: string,
    benefitType: string // BATH | PERCENT | PRICE
    isMemberSpecific: boolean
    isBranchSpecific: boolean
    startDate: NgbDateStruct
    endDate: NgbDateStruct
    //promotionStatus: "ACTIVE",
    promotionPriority: number
    promotionOrder: number
    activeDay: [boolean, boolean, boolean, boolean, boolean, boolean, boolean], // 1111111
    limitTime: boolean
    startTime: NgbTimeStruct
    endTime: NgbTimeStruct
    promotionBenefit: TPromotionBenefit[]
    members: TMember
    branches: TBranch[]
    pwpPool: TPWPPool[]
    inlinePool: TInlinePool[]
}

export type TPromotionHead = {}

export type TPromotionBenefit = {
    thresholdBath: number,
    thresholdCount: number,
    benefitBath: number,
    benefitPercent: number,
    benefitPrice: number,
    pwpCount: number,
}

export type TBranch = {
    branchCode: string
    branchName: string
}
// for fix bundle +/- count per group
export type TProductPool = {
    goodCode: string
    goodName: string
    sku: string
    poolGroup: number
}

export type TPWPPool = {
    goodCode: string
    goodName: string
    sku: string
    pwpPrice: number
}

export type TInlinePool = {
    goodCode: string
    goodName: string
    sku: string
    discount: number
}

export type TDayState = [boolean, boolean, boolean, boolean, boolean, boolean, boolean]

export type TMember = [boolean, boolean, boolean, boolean, boolean, boolean, boolean]

export type TPromotionVariationCongif = Pick<TPromotionFormState, 'promotionType' | 'benefitType' | 'thresholdType'>

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