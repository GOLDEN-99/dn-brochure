import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TOtherIncomeInvoice } from "../../../../shared/types/other-income.type";

export type TMaybeString = TOtherIncomeInvoice | string

export type TPartialMatchInvoice = {
    invoice: TMaybeString,
    matchAmount: string
}

export type TMatchingOnCreate = {
    receNumb: string
    receAmount: string
    receRemark: string
    receDate: NgbDateStruct
    matches: Array<TPartialMatchInvoice>
}