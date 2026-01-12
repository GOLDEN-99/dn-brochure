import { inject } from "@angular/core";
import { ApiService } from "../api/api.service";
import { Observable } from "rxjs";
import { TOIComp } from "./company.service";
import { TEvent } from "./event.service";
import { TIncome } from "./income.service";
import { TOIStepItem, PeriodStatus } from "../../types";
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

export type ManyContactResponse = {
    id: number
    displayName: string
    startDate: string,
    endDate: string,
    compCode: string,
    compName: string
    eventName: string
    eventType: number
    compType: string
    incomeName: string
    incomeType: number
}

export type ManyContactLightResponse = { totalBranch: number; totalAmount: number } & ManyContactResponse

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
    event: TEvent
    income: TIncome
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

export type TContactHead = {
    id: number
    period: number,
    startDate: string,
    endDate: string,
    displayName: string
    accAmount: number,
    amountDate: string | null,
    accIncome: number
    incomeDate: string | null
    receAmount: number
    invAmount: number
}

export type TContactNotLight = {
    id: number
    incVat: boolean
    isRebate: boolean
    isDc: boolean
    isComp: boolean
    isInce: boolean
    capAmount: number | null
    stepType: number
}

export type TPeriodResult = {
    id: number
    periodName: string
    totalAmount: number
    totalIncome: number
    invAmount: number
    invDate: string | null
    orderAmount: number
    orderDate: string | null
    receAmount: number
    receDate: string | null
    creditAmount: number
    creditDate: string | null
    periodRemark: string
    periodStatus?: PeriodStatus | null
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
    invDate: string
    invRemark: string
    checkDate: string | null
}

export type TCreditNoteDto = {
    id: number
    creditNumb: string
    creditAmount: number
    creditDate: string
    creditRemark: string
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
    creditList: TCreditNoteDto[]
} & TPeriodResult

export type NotLightSingle = {
    head: TContactHead
    notLight: TContactNotLight
    stepList: TOIStepItem[]
    productList: { id: number, goodCode: string, goodName: string, barCode: string }[]
    incomeList: TIncomeItem[]
    periodList: TPopulatedPeriodResult[]
    company: TOIComp
    event: TEvent,
    income: TIncome,
}


export type TIncomeItem = {
    id: number
    calAmount: number
    actualAmount: number
    startDate: string
    endDate: string
    cn: number
    reason: string
    checkDate: string | null
    incomeAmount: number
}

export type TEnchanceIncomeItem = TIncomeItem & {
    accPurchase: number
}

export type TBranchItem = {
    id: number
    branchCode: string
    branchName: string
    openDate: string
}

export type TContactLight = {
    id: number
    totalBranch: number
    totalAmount: number
    currentBranch: number
}

export type TLightSummary = {
    head: TContactHead
    light: TContactLight
    company: TOIComp
    event: TEvent,
    income: TIncome,
}


export type TDetailLight = {
    incomeList: TIncomeItem[]
    branchList: TBranchItem[]
    periodList: TPopulatedPeriodResult[]
} & TLightSummary