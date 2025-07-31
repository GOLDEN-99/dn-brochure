import { inject } from "@angular/core";
import { ApiService } from "../api/api.service";
import { Observable } from "rxjs";
import { TOIComp } from "./company.service";
import { TEvent } from "./event.service";
import { TIncome } from "./income.service";
import { TOIStepItem } from "../../types";
import { environment } from "../../../environments/environment";

export abstract class BaseOiService {
    protected api = inject(ApiService)
    protected url = environment.oi

    abstract getAll(query: any): Observable<any>
    abstract getById(id: number, compType: string): Observable<any>
    abstract create(req: any): Observable<any>
    abstract update(id: number, req: any): Observable<any>
}

export interface ISharedHead {
    id: number
    period: number
    startDate: string
    endDate: string
    company: TOIComp
    event: TEvent
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
    receAmount: number
    invAmount: number
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

export type TOrderItemDto = {
    id: number
    orderNumb: string
    actualAmount: number
    supInvNumb: string | null
    supInvDate: string | null
    receNumb: string | null
}

export type TInviceItemDto = {
    id: number
    invNumb: string
    invAmount: number
    withholding: number
    invDate: string
    checkDate: string | null
}

export type TReceiptItemDto = {
    id: number
    receNumb: string
    receAmount: number
    receRemark: string
    receDate: string
    checkDate: string | null
}

export type TPopulatedPeriodResult = {
    orderList: TOrderItemDto[]
    invoiceList: TInviceItemDto[]
    receiptList: TReceiptItemDto[]
} & TPeriodResult

export type NotLightSingle = {
    stepList: TOIStepItem[]
    productList: { id: number, goodCode: string, goodName: string }[]
    incomeList: TIncomeItem[]
    periodList: TPopulatedPeriodResult[]
} & NotLightSummary


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
    accAmount: number,
    amountDate: string | null,
    accIncome: number
    incomeDate: string | null
    receAmount: number
    invAmount: number
}


export type TDetailLight = {
    incomeList: TIncomeItem[]
    branchList: TBranchItem[]
    periodList: TPopulatedPeriodResult[]
} & TLightSummary