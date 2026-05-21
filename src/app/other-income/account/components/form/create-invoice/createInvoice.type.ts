import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export type TCreateInvoiceForm = {
    invNumb: string
    invAmount: string
    invRemark: string
    invDate: NgbDateStruct
}