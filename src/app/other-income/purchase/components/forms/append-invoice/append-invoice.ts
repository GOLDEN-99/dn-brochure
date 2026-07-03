import { required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const appendInvoiceSchema = schema<AppendInvoiceForm>((schema) => {
  required(schema.invoiceNumb, { message: "กรุณาใส่เลขที่ใบแจ้งหนี้" })
  required(schema.invoiceAmount, { message: "กรุณากรอกตัวเลข" })
})

export type AppendInvoiceForm = {
  invoiceNumb: string
  invoiceDate: NgbDateStruct
  invoiceAmount: number
  invoiceRemark: string
}
