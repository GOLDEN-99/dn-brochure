import { apply, required, schema } from "@angular/forms/signals";
import { TDateRangeFormState } from "../../../../shared/types/other-income.type";
import { dateRangeSchema } from "../create-schema";

export const createPairedSettlementSchema = schema<CreatePairedSettlementForm>((schema) => {
    required(schema.periodName, { message: "กรุณาระบุชื่องวด" })
    apply(schema.dateRange, dateRangeSchema)
})

export type CreatePairedSettlementForm = {
    periodName: string;
    dateRange: TDateRangeFormState;
    remark: string;
}
