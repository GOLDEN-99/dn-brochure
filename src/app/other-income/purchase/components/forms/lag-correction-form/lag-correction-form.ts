import { applyEach, min, required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TSearchOrderResult } from "../../../services/other-income-search-order.service";
import { TMaybe } from "../../../../../shared/types/index.type";

export const lagItemSchema = schema<TLagItems>((schema) => {
    required(schema.order, { message: "ต้องเลือกเลขที่ order" })
    required(schema.amount, { message: "ยอดต้องไม่เป็น 0" })
    min(schema.amount, 0, { message: "ยอดต้องมากกว่า 0" })
})

export const lagCorrectionSchema = schema<LagCorrectionForm>((schema) => {
    applyEach(schema.lagItems, lagItemSchema)
})

export type TLagItems = {
    order: TMaybe<TSearchOrderResult>;
    amount: number;
}

export type LagCorrectionForm = {
    month: NgbDateStruct;
    lagItems: TLagItems[]
}
