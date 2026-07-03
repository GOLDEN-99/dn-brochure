import { required, schema, validate } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TInvoiceWithRemaining } from "../../../../account/components/form/create-receipt/createReceiptForm.type";

export const appendReceiptSchema = schema<AppendReceiptForm>((schema) => {
  required(schema.receNumb, { message: "กรุณาใส่เลขที่ใบเสร็จ" })
  required(schema.receAmount, { message: "กรุณากรอกตัวเลข" })
  required(schema.matchInvoice, { message: "กรุณาเลือกใบแจ้งหนี้ที่จะจับคู่" })
  validate(schema.matchAmount, ({ value, valueOf }) => {
    const amount = value()
    if (amount <= 0) return { kind: 'invalid-amount', message: 'ยอดจับคู่ต้องมากกว่า 0' }
    const invoice = valueOf(schema.matchInvoice)
    if (invoice && amount > invoice.remainingAmount) {
      return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องไม่เกิน ${invoice.remainingAmount} บาท (ยอดคงเหลือของใบแจ้งหนี้)` }
    }
    return null
  })
})

export type AppendReceiptForm = {
  receNumb: string
  receDate: NgbDateStruct
  receAmount: number
  receRemark: string
  matchInvoice: TInvoiceWithRemaining | null
  matchAmount: number
}
