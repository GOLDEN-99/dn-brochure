import { applyEach, required, schema, validate } from "@angular/forms/signals";
import { TMatchingOnCreate, TPartialMatchInvoice } from "./macthingOnCreate.type";

export const defaultPartialMatch: TPartialMatchInvoice = { invoice: '', matchAmount: '0' }

export const partialMatchSchema = schema<TPartialMatchInvoice>((schema) => {
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

export const defaultCreateReceipt: Omit<TMatchingOnCreate, 'receDate'> = {
    receNumb: '',
    receAmount: '0',
    receRemark: '',
    matches: [defaultPartialMatch]
}

export const createReceiptSchema = schema<TMatchingOnCreate>((schema) => {
    required(schema.receAmount, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
    validate(schema.receAmount, ({ value }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        return null
    })
    applyEach(schema.matches, partialMatchSchema)
})