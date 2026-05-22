import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TOtherIncomeInvoice } from "../../../../shared/types/other-income.type";

export type TMaybeString = TOtherIncomeInvoice | string

export type TPartialMatchInvoice = {
    invoice: TOtherIncomeInvoice,
    matchAmount: string
}

export type TCreateReceiptForm = {
    receNumb: string
    receAmount: string
    receRemark: string
    remainingInvoice: number
    receDate: NgbDateStruct
    matches: Array<TPartialMatchInvoice>
}