import { inject } from "@angular/core";
import { SupplierFromService } from "../../service/supplier/supplier-form/supplier-from.service";

export class BaseSupplierForm {
    protected formService = inject(SupplierFromService)
}