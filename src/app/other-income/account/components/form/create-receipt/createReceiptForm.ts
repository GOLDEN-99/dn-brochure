import { applyEach, readonly, required, schema, validate } from "@angular/forms/signals";
import { TCreateReceiptForm, TPartialMatchInvoice } from "./createReceiptForm.type";
import { validateAmountField } from "../../../../../shared/libs/signal-form-custom-vaildator";

export const partialMatchSchema = schema<TPartialMatchInvoice>((schema) => {
    required(schema.invoice, { message: 'กรุณาเลือกใบแจ้งหนี้' })
    required(schema.matchAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.matchAmount, ({ value, valueOf }) => {
        const current = value()
        const parsed = Number.parseFloat(current)
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'ไม่สามารถแปลงค่าเป็นหัวเลขได้' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        const inv = valueOf(schema.invoice)
        if (typeof inv !== 'string') {
            const max = inv.remainingAmount ?? 0
            if (parsed > max) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องน้อยกว่า ${max} บาท` }
        }
        return null
    })
})

export const defaultCreateReceipt: Omit<TCreateReceiptForm, 'receDate' | 'remainingInvoice'> = {
    receNumb: '',
    receAmount: '0',
    receRemark: '',
    matches: []
}

export const createReceiptSchema = schema<TCreateReceiptForm>((schema) => {
    required(schema.receNumb, { message: 'กรุณาใส่เลขที่ใบเสร็จ' })
    required(schema.receAmount, { message: 'กรุณากรอกตัวเลข' })
    readonly(schema.remainingInvoice)
    validateAmountField(schema.receAmount, schema.remainingInvoice, 'ยอดใบเสร็จมากกว่ายอดใบแจ้งหนี้คงเหลือ')
    applyEach(schema.matches, partialMatchSchema)
    validate(schema.matches, ({ value, valueOf }) => {
        const ref = new Map<string, number>()
        let acc = 0;
        const maximum = Number.parseFloat(valueOf(schema.receAmount))
        const current = value();
        for (const { invoice: { invNumb, remainingAmount }, matchAmount } of current) {
            const matchNumber = Number.parseFloat(matchAmount)
            if (Number.isNaN(matchNumber)) continue
            acc += matchNumber
            if (acc > maximum) return { kind: 'invalid-acc-match', message: 'ยอดจับคู่มากกว่ายอดใบเสร็จ' }
            const amount = ref.get(invNumb)
            if (typeof amount === 'number') {
                const newAmount = amount - matchNumber;
                if (newAmount < 0) return { kind: 'invalid-match', message: 'ยอดจับคู่มากกว่ายอดที่เหลืออยู่' }
                ref.set(invNumb, newAmount);
            } else {
                ref.set(invNumb, remainingAmount - matchNumber)
            }
        }
        return null
    })
})

export const createReceiptSchemaWithMaximum = (maximum: number) => schema<TCreateReceiptForm>((schema) => {
    required(schema.receNumb, { message: 'กรุณาใส่เลขที่ใบเสร็จ' })
    required(schema.receAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.receAmount, ({ value }) => {
        const parsed = Number.parseFloat(value())
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องมากกว่า 0` }
        return parsed > maximum ? { kind: 'max', message: 'ยอดใบเสร็จมากกว่ายอดใบแจ้งหนี้คงเหลือ' } : null
    })
    applyEach(schema.matches, partialMatchSchema)
    validate(schema.matches, ({ value, valueOf }) => {
        const ref = new Map<string, number>()
        let acc = 0;
        const maximum = Number.parseFloat(valueOf(schema.receAmount))
        const current = value();
        for (const { invoice: { invNumb, remainingAmount }, matchAmount } of current) {
            const matchNumber = Number.parseFloat(matchAmount)
            if (Number.isNaN(matchNumber)) continue
            acc += matchNumber
            if (acc > maximum) return { kind: 'invalid-acc-match', message: 'ยอดจับคู่มากกว่ายอดใบเสร็จ' }
            const amount = ref.get(invNumb)
            if (typeof amount === 'number') {
                const newAmount = amount - matchNumber;
                if (newAmount < 0) return { kind: 'invalid-match', message: 'ยอดจับคู่มากกว่ายอดที่เหลืออยู่' }
                ref.set(invNumb, newAmount);
            } else {
                ref.set(invNumb, remainingAmount - matchNumber)
            }
        }
        return null
    })
})
