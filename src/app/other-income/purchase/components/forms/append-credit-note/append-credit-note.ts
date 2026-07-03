import { required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const appendCreditNoteSchema = schema<AppendCreditNoteForm>((schema) => {
  required(schema.creditNumb, { message: "กรุณาใส่เลขที่ใบลดหนี้" })
  required(schema.creditAmount, { message: "กรุณากรอกตัวเลข" })
})

export type AppendCreditNoteForm = {
  creditNumb: string
  creditDate: NgbDateStruct
  creditAmount: number
  creditRemark: string
}
