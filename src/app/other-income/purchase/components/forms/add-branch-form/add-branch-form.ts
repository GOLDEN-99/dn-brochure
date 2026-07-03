import { required, schema } from "@angular/forms/signals";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const addBranchSchema = schema<AddBranchForm>((schema) => {
    required(schema.branchCode, { message: "กรุณาระบุรหัสสาขา" })
})

export type AddBranchForm = {
    branchCode: string;
    branchName: string;
    openDate: NgbDateStruct;
}
