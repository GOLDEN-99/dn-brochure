import { Signal } from "@angular/core"
import { NgbDate, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

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

export type TCommonIncome = {
    cn: string,
    productList: TProduct[]
} & TBaseFormData & TSupplierComp & TCommonTarget & TLimit
