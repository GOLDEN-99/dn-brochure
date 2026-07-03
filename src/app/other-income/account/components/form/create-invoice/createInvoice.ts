import { readonly, required, schema } from "@angular/forms/signals";
import { TCreateInvoiceForm } from "./createInvoice.type";
import { validateAmountField } from "../../../../../shared/libs/signal-form-custom-vaildator";

export const defaultInvoice: Omit<TCreateInvoiceForm, 'invoiceDate' | 'remainingIncome'> = {
    invoiceAmount: '0',
    invoiceNumb: '',
    invoiceRemark: ''
}

export const createInvoiceSchema = schema<TCreateInvoiceForm>((schema) => {
    required(schema.invoiceNumb, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
    required(schema.invoiceAmount, { message: 'กรุณากรอกตัวเลข' })
    readonly(schema.remainingIncome)
    validateAmountField(schema.invoiceAmount, schema.remainingIncome, 'ยอดใบแจ้งหนี้มากกว่ารายได้')
})
