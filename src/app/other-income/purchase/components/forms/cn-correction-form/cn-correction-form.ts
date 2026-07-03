import { applyEach, min, required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TSearchProductResult } from "../../../services/other-income-search-product.service";
import { TMaybe } from "../../../../../shared/types/index.type";

export const cnItemSchema = schema<TCNItems>((schema) => {
    required(schema.product, { message: "ต้องเลือกสินค้า" })
    required(schema.amount, { message: "ยอด cn ต้องไม่เป็น 0" })
    min(schema.amount, 0, { message: "ยอด CN ต้องมากกว่า 0" })
})

export const cnCorrectionSchema = schema<CnCorrectionForm>((schema) => {
    applyEach(schema.cnItems, cnItemSchema)
})

export type TCNItems = {
    product: TMaybe<TSearchProductResult>;
    amount: number;
}

export type CnCorrectionForm = {
    month: NgbDateStruct;
    note: string;
    cnItems: TCNItems[]
}