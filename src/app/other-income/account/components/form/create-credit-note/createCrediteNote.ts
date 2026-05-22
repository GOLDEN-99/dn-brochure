import { readonly, required, schema } from "@angular/forms/signals"
import { TCreateCreditNoteForm } from "./createCreditNote.type"
import { validateAmountField } from "../../../../../shared/libs/signal-form-custom-vaildator"


export const defaultCreditNote: Omit<TCreateCreditNoteForm, 'creditDate' | 'remainingIncome'> = {
    creditAmount: '0',
    creditNumb: '',
    creditRemark: ''
}

export const createCreditNoteSchema = schema<TCreateCreditNoteForm>((schema) => {
    required(schema.creditNumb, { message: 'กรุณาใส่เลขที่ใบลดหนี้' })
    required(schema.creditAmount, { message: 'กรุณากรอกตัวเลข' })
    readonly(schema.remainingIncome)
    validateAmountField(schema.creditAmount, schema.remainingIncome, 'ยอดใบลดหนี้มากกว่ารายได้')
})
