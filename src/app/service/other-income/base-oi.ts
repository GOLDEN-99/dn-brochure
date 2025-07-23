import { inject } from "@angular/core";
import { ApiService } from "../api/api.service";
import { Observable } from "rxjs";
import { TOIComp } from "./company.service";
import { TEvent } from "./event.service";
import { TIncome } from "./income.service";
import { TOIStepItem } from "../../types";

export abstract class BaseOiService {
    protected api = inject(ApiService)
    private baseUrl = ''

    match(invId: number, receId: number) {
        return this.api.post(`${this.baseUrl}/`, { invId, receId })
    }

    getMatch(id: number) {
        this.api.get(`${this.baseUrl}/${id}/matches`)
    }

    getIncome(id: number) {
        return this.api.get(`${this.baseUrl}/${id}/incomes`)
    }

    createTerm(id: number, incomeList: {}) {
        return this.api.post(`${this.baseUrl}/${id}/terms`, incomeList)
    }

    abstract getAll(query: any): Observable<any>
    abstract getById(id: number): Observable<any>
    abstract create(req: any): Observable<any>
    abstract update(id: number, req: any): Observable<any>
}

export type NotLightSummary = {
    id: number
    notLightId: number,
    displayName: string,
    period: number,
    startDate: string,
    endDate: string,
    isStep: boolean,
    capAmount: number | null,
    incVat: boolean,
    cn: string,
    company: TOIComp
    event: TEvent,
    income: TIncome,
    isRebate: boolean,
    isDc: boolean,
    isComp: boolean,
    isInce: boolean,
    accAmount: number,
    amountDate: string | null,
    accIncome: number
    incomeDate: string | null
}

export type TPeriodResult = {
    id: number
    remark: string
    totalAmount: number
    totalIncome: number
    invAmount: number
    invDate: string | null
    orderAmount: number
    receAmount: number
    receDate: string | null
}

export type NotLightSingle = {
    stepList: TOIStepItem[]
    productList: { id: number, goodCode: string, goodName: string }[]
    incomeList: TIncomeItem[]
    periodList: TPeriodResult[]
} & NotLightSummary


// type TProductItem = {
//   id: number
//   goodCode: string
//   goodName: string
// }

// type TStepRes = {
//   id: number
//   min: number
//   max: number | null
//   rate: number
// }

export type TIncomeItem = {
    id: number
    calAmount: number
    actualAmount: number
    createDate: string
    reason: string
    checkDate: string | null
    incomeAmount: number
}

export type TBranchItem = {
    id: number
    branchCode: string
    branchName: string
    openDate: string
}

export type TLightSummary = {
    id: number
    lightId: number
    period: number
    startDate: string
    endDate: string
    totalBranch: number
    totalAmount: number
    company: TOIComp
    event: TEvent,
}


export type TDetailLight = {
    incomeList: TIncomeItem[]
    branchList: TBranchItem[]
    periodList: TPeriodResult[]
} & TLightSummary