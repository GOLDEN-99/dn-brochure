import { ActivatedRoute, Router } from "@angular/router";
import { SupplierApiService } from "../../service/supplier/supplier-api.service";

export const inboundApiServiceFactory = (router: Router): SupplierApiService => {
    const compType = router.routerState.root.snapshot.paramMap.keys
    console.log(compType)
    return new SupplierApiService('DN');
}  