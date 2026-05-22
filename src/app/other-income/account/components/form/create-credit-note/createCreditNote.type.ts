import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export type TCreateCreditNoteForm = {
    remainingIncome: number
    creditNumb: string
    creditAmount: string
    creditRemark: string
    creditDate: NgbDateStruct
}