import { Signal } from "@angular/core"
import { NgbDate, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"
import { TCsBool } from "./shared.type"

export type TDiscount = {
    discount: boolean
    discountType: number // discount type id
}

interface IDateRange {
    fromDate: any
    toDate: any
}

type TDateRange = {
    fromDate: string
    toDate: string
}

type TDateRangeObj = {
    fromDate: NgbDate
    toDate: NgbDate
}

type TBaseFormData = {
    period: number // period id
    incVat: boolean
    event: number // event id
} & TDateRangeObj & TDiscount

export interface IDateRangeStuct {
    fromDate: Signal<NgbDate>
    toDate: Signal<NgbDate>
}

export interface IDiscount {
    discount: Signal<boolean>
    discountType: Signal<number>
}

export interface IBaseform {
    period: Signal<number>
    incVat: Signal<boolean>
}

type TSpecialTarget = {
    target: number // amount of branch
    targetAmount: number // amount of money
}

type TSupplierComp = {
    compCode: string
    compName: string
}

export interface ISupplierComp {
    compCode: Signal<string>
    compName: Signal<string>
}

export type TStepItem = {
    start: number
    percent: number
}

type TCommonTarget = {
    target: number // target type
    step: TStepItem[] // if target === 2 , 3 > step.length !== 0
    percent: number // if target === 1 > percent !== 0
}

export type TSpecialIncome = TSpecialTarget & TBaseFormData


export type TLimit = {
    limit: boolean
    limitAmount: number
}

export type TProduct = {
    id: string,
    productName: string
}

export type TOIProduct = { goodCode: string, goodName: string }

export type TCommonIncome = {
    cn: string,
    productList: TOIProduct[]
} & TBaseFormData & TSupplierComp & TCommonTarget & TLimit

type TFormat = 'app' | 'api'
type TDate<T extends TFormat> = T extends 'app' ? NgbDateStruct : string //iso string

export type TCompType = 'DN' | 'HU'
export type TBaseOIHead<T extends TFormat> = {
    id: number
    incomeId: number
    eventId: number
    compCode: string
    compName: string
    compType: TCompType
    period: number
    displayName: string
    startDate: TDate<T>
    endDate: TDate<T>
    timestamp: string //iso
}

export type TBaseOiInsert<T extends TFormat> = Pick<TBaseOIHead<T>, 'eventId' | 'displayName' | 'compCode' | 'compName' | 'compType' | 'period' | 'startDate' | 'endDate'> & { incomeIds: number[]; dualPairId?: number | null }

export interface IBaseOiHeadDTO {
    id?: number
    eventId: number
    compCode: string
    compType: TCompType
    period: number
    startDate: string // iso
    endDate: string // iso
    timestamp?: string //iso
}

export type TNotLightHead = {
    incomeId: number
    discountId: number
    cn: string
    stepId: number
    capAmou: number
    incVat: boolean
}

export type TInsertOINotLight = {
    eventId: number
    compCode: string
    compType: TCompType
    period: number
    startDate: string // iso
    endDate: string // iso
} & TNotLightHead

export type TLightHead = {
    totalBranch: number
    totalAmou: number
}

export type TInsertOILight = {
    eventId: number
    compCode: string
    compType: TCompType
    period: number
    startDate: string // iso
    endDate: string // iso
} & TLightHead

export type TInsertOILightState = {
    eventId: number
    compCode: string
    compType: TCompType
    period: number
    startDate: NgbDateStruct
    endDate: NgbDateStruct
} & TLightHead


export type TOIStepItem = {
    min: number
    max: number | null
    rate: number
}

export type TOIStep = {
    stepName: string // flat step1 step2
    isStep: TCsBool
}

export type TInsertOIStep = { steps: TOIStepItem[] } & TOIStep

export type TBranch = {
    branchCode: string
    openDate: string //iso 
}

export type TBranchState = {
    branchCode: string
    openDate: NgbDateStruct
}

export type TInsertMonthlyIncome = {
    calAmou: number
    actualAmou: number
    reason: string
    createDate: string //iso
}

export type TInsertMonthlyIncomeState = {
    calAmou: number
    actualAmou: number
    reason: string
    createDate: NgbDateStruct
}


export interface IOtherIncomePageToke {
    isPurchase: boolean
}

export enum PeriodStatus {
    All = 1,
    Complete = 2,
    Invoice = 3,
    Receipt = 4
}