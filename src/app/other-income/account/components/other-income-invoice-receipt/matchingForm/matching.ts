import { required, schema, validate } from "@angular/forms/signals";
import { TMatchingState } from "./matching.type";

export const defaultMatching: TMatchingState = { invoice: '', receipt: '', matchAmount: '0' }

export const matchingSchema = schema<TMatchingState>((schema) => {
    required(schema.invoice, { message: 'เลือกใบแจ้งหนี้', })
    validate(schema.invoice, ({ value }) => {
        const current = value()
        if (typeof current === 'string') return { kind: 'required-invoice', message: 'เลือกใบแจ้งหนี้' }
        return null
    })
    required(schema.receipt, { message: 'เลือกใบเสร็จรับเงิน', })
    validate(schema.receipt, ({ value }) => {
        const current = value()
        if (typeof current === 'string') return { kind: 'required-invoice', message: 'เลือกใบเสร็จรับเงิน', }
        return null
    })
    validate(schema.matchAmount, ({ value, valueOf }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        const inv = valueOf(schema.invoice)
        const rece = valueOf(schema.receipt)
        if (typeof inv !== 'string' && typeof rece !== 'string') {
            const max = Math.min(inv.invoiceAmount ?? 0, rece.receAmount ?? 0)
            if (parsed > max) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องน้อยกว่า ${max} บาท` }
        }
        return null
    })
})

