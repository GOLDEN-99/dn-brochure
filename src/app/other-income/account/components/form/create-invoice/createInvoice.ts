import { required, schema, validate } from "@angular/forms/signals";
import { TCreateInvoiceForm } from "./createInvoice.type";

export const defaultInvoice: Omit<TCreateInvoiceForm, 'invDate'> = {
    invAmount: '0',
    invNumb: '',
    invRemark: ''
}

export const createInvoiceSchema = schema<TCreateInvoiceForm>((schema) => {
    required(schema.invNumb, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
    required(schema.invAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.invAmount, ({ value }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        return null
    })
})