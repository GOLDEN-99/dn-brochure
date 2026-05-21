import { TOtherIncomeInvoice, TOtherIncomeReceipt } from "../../../../shared/types/other-income.type"

export type TMatchingState = {
    invoice: TOtherIncomeInvoice | string
    receipt: TOtherIncomeReceipt | string
    matchAmount: string
}