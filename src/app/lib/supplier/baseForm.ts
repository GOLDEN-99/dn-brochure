import { inject } from "@angular/core";
import { SupplierFromService } from "../../service/supplier/supplier-from.service";

export class BaseSupplierForm {
    protected formService = inject(SupplierFromService)
}