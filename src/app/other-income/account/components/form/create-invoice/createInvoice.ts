import { readonly, required, schema } from "@angular/forms/signals";
import { TCreateInvoiceForm } from "./createInvoice.type";
import { validateAmountField } from "../../../../../shared/libs/signal-form-custom-vaildator";

export const defaultInvoice: Omit<TCreateInvoiceForm, 'invDate' | 'remainingIncome'> = {
    invAmount: '0',
    invNumb: '',
    invRemark: ''
}

export const createInvoiceSchema = schema<TCreateInvoiceForm>((schema) => {
    required(schema.invNumb, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
    required(schema.invAmount, { message: 'กรุณากรอกตัวเลข' })
    readonly(schema.remainingIncome)
    validateAmountField(schema.invAmount, schema.remainingIncome, 'ยอดใบแจ้งหนี้มากกว่ารายได้')
})
