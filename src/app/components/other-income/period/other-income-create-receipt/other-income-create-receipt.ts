import { required, schema, validate } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export type TCreateReceiptForm = {
    receNumb: string
    receAmount: string
    receRemark: string
    remainingInvoice: number
    receDate: NgbDateStruct
}

export const defaultCreateReceipt: Omit<TCreateReceiptForm, 'receDate' | 'remainingInvoice'> = {
    receNumb: '',
    receAmount: '0',
    receRemark: '',
}

export const createReceiptSchema = schema<TCreateReceiptForm>((schema) => {
    required(schema.receNumb, { message: 'กรุณาใส่เลขที่ใบเสร็จ' })
    required(schema.receAmount, { message: 'กรุณากรอกตัวเลข' })
    validate(schema.receAmount, ({ value }) => {
        const parsed = Number.parseFloat(value())
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        return parsed <= 0 ? { kind: 'invalid-amount', message: 'กรุณากรอกตัวเลขมากกว่า 0' } : null
    })
})
