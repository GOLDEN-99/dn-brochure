import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export type TCreateInvoiceForm = {
    remainingIncome: number
    invoiceNumb: string
    invoiceAmount: string
    invoiceRemark: string
    invoiceDate: NgbDateStruct
}