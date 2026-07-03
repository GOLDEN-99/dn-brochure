import { applyWhen, required, schema, validate } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export type ManualCorrectionForm = {
    month: NgbDateStruct;
    contractType: 'ORDER' | 'BRANCH' | 'PROMO';
    amount: number;
    orderAmount: number
    note: string;
}

// contractType decides which single field is the "real" amount:
// orderAmount for ORDER, amount for BRANCH/PROMO — the UI only ever shows
// one amount input, bound to whichever field applies for the current type.
// Amount must be a positive magnitude (matches CN/lag's convention) — sign
// is not user-entered here. Note: min(x, 0) allows 0 (it's an inclusive
// bound), and required() doesn't reject numeric 0 either — same caveat as
// cn-correction-form — so a strict ">0" check needs validate(), not min().
export const manualCorrectionSchema = schema<ManualCorrectionForm>((schema) => {
    required(schema.month, { message: "ต้องเลือกเดือน" })
    applyWhen(schema, ({ value }) => value().contractType === 'ORDER', (s) => {
        required(s.orderAmount, { message: "ยอดต้องไม่เป็น 0" })
        validate(s.orderAmount, ({ value }) => value() > 0 ? null : { kind: 'non-positive-amount', message: "ยอดต้องมากกว่า 0" })
    })
    applyWhen(schema, ({ value }) => value().contractType !== 'ORDER', (s) => {
        required(s.amount, { message: "ยอดต้องไม่เป็น 0" })
        validate(s.amount, ({ value }) => value() > 0 ? null : { kind: 'non-positive-amount', message: "ยอดต้องมากกว่า 0" })
    })
})