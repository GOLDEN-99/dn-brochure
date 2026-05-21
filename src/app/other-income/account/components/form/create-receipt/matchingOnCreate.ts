import { applyEach, required, schema, validate } from "@angular/forms/signals";
import { TCreateReceiptForm, TPartialMatchInvoice } from "./createReceiptForm.type";


export const defaultPartialMatch: TPartialMatchInvoice = { invoice: '', matchAmount: '0' }

export const partialMatchSchema = schema<TPartialMatchInvoice>((schema) => {
    required(schema.invoice, { message: 'กรุณาเลือกใบแจ้งหนี้' })
    required(schema.matchAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.matchAmount, ({ value, valueOf }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        const inv = valueOf(schema.invoice)
        if (typeof inv !== 'string') {
            const max = inv.invAmount ?? 0
            if (parsed > max) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องน้อยกว่า ${max} บาท` }
        }
        return null
    })
})

export const defaultCreateReceipt: Omit<TCreateReceiptForm, 'receDate'> = {
    receNumb: '',
    receAmount: '0',
    receRemark: '',
    matches: [defaultPartialMatch]
}

export const createReceiptSchema = schema<TCreateReceiptForm>((schema) => {
    required(schema.receNumb, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
    required(schema.receAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.receAmount, ({ value }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        return null
    })
    applyEach(schema.matches, partialMatchSchema)
})