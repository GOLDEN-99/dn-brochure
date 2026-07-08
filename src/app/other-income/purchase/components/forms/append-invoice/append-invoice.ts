import { max, min, required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const appendInvoiceSchema = schema<AppendInvoiceForm>((schema) => {
  required(schema.invoiceNumb, { message: "กรุณาใส่เลขที่ใบแจ้งหนี้" })
  min(schema.invoiceAmount, 1, { message: "ยอดใบแจ้งหนี้ขั้นต่ำ 1 บาท" })
  max(schema.invoiceAmount, ({ valueOf }) => valueOf(schema.openSettleAmount), { message: 'ยอดใบแจ้งหนี้ต้องไม่เกินยอดเรียกเก็บคงเหลือ' })
  required(schema.invoiceAmount, { message: "กรุณากรอกตัวเลข" })
})

export type AppendInvoiceForm = {
  openSettleAmount: number
  invoiceNumb: string
  invoiceDate: NgbDateStruct
  invoiceAmount: number
  invoiceRemark: string
}
