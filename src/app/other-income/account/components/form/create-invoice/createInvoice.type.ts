import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export type TCreateInvoiceForm = {
    remainingIncome: number
    invNumb: string
    invAmount: string
    invRemark: string
    invDate: NgbDateStruct
}