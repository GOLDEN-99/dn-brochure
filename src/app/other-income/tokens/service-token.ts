import { InjectionToken, Signal } from "@angular/core";
import { TContractIncomeType, TContractBase } from "../shared/types/other-income.type";
import { TMaybe } from "../../types";


interface ForContractDisplay {
    id: number
    compCode: string
    compName: TMaybe<string>
    compType: 'DN' | 'HU'
    contractLabelId: number
    contractLabelName: string
    settlementPeriod: number
    startDate: string
    endDate: string
    createdAt: string
    incomeTypes: TContractIncomeType[]
}

export interface ForContractData {
    contract: Signal<ForContractDisplay | null>
}

export const FOR_CONTRACT_DATA_TOKEN = new InjectionToken<ForContractData>('FOR_CONTRACT_DATA_TOKEN')