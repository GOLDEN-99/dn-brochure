import { required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const addPromoAccrualSchema = schema<AddPromoAccrualForm>((schema) => {
    required(schema.amount, { message: "ยอดต้องไม่เป็น 0" })
})

export type AddPromoAccrualForm = {
    month: NgbDateStruct;
    amount: number;
}
