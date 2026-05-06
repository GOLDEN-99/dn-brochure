import { Route } from "@angular/router";
import { handleLazyLoadError } from "../utils/lazy-load-error-handler";
import { CRM_PAGE_CONFIG } from "../service/crm-promotion/crm-token";
import { ProductGroupConfigService } from "../service/crm-promotion/product-group-config.service";
import { provideCreatePromotionConfig } from "../factory/crm-promotion/create-promotion";
import { CrmPromotionLayoutComponent } from "../layout/crm-promotion-layout/crm-promotion-layout.component";

export const CREATE_ROUTE_PATH = [
    { path: "create-inline", name: 'ลดรายสินค้า', icon: 'bi bi-list-ul me-2' },
    { path: "create-bill", name: 'ส่วนลดท้ายบิล', icon: 'bi bi-receipt me-2' },
    { path: "create-group", name: 'ส่วนลดตามกลุ่มสินค้า', icon: 'bi bi-tags me-2' }
]



const CREATE_ROUTE = CREATE_ROUTE_PATH.map<Route>(({ path }) => ({
    path: path,
    providers: [
        {
            provide: CRM_PAGE_CONFIG,
            useValue: provideCreatePromotionConfig(path)
        }
    ],
    loadComponent() {
        return import("../pages/crm-promotion/create/create-bill-discount-promotion/create-bill-discount-promotion.component")
            .then(r => r.CreateBillDiscountPromotionComponent)
            .catch(handleLazyLoadError('crm-promotion/create'))
    }
}))

export const CRM_PROMOTION_ROUTE: Route[] = [
    {
        path: "crm-promotion",
        children: [
            {
                path: "",
                component: CrmPromotionLayoutComponent,
                children: [
                    {
                        path: "",
                        loadComponent() {
                            return import("../pages/crm-promotion/promotions/promotions.component")
                                .then(r => r.PromotionsComponent)
                                .catch(handleLazyLoadError('crm-promotion/promotions'))
                        }
                    },
                    ...CREATE_ROUTE,
                    {
                        path: "config-branch",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-branch-config/create-branch-config.component")
                                .then(r => r.CreateBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config/branch'))
                        },
                    },
                    {
                        path: "config-branch/:branchGroupId",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/edit-branch-config/edit-branch-config.component")
                                .then(r => r.EditBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config/branch/:branchId'))
                        },
                    },
                    {
                        path: "config-product",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-product-config/create-product-config.component")
                                .then(r => r.CreateProductConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config/product"))
                        }
                    },
                    {
                        path: "config-product/:productGroupId",
                        providers: [ProductGroupConfigService],
                        children: [
                            {
                                path: "",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/edit-product-config/edit-product-config.component")
                                        .then(r => r.EditProductConfigComponent)
                                        .catch(handleLazyLoadError("crm-promotion/config/product/:productGroupId"))
                                }
                            },
                            {
                                path: "add",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/add-product-config/add-product-config.component")
                                        .then(r => r.AddProductConfigComponent)
                                        .catch(handleLazyLoadError("crm-promotion/config/product/:productGroupId/add"))
                                }
                            }
                        ]
                    },
                    {
                        path: "config-promotion-set",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-promotion-set-config/create-promotion-set-config.component")
                                .then(r => r.CreatePromotionSetConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config/promotion-set"))
                        }
                    },

                    {
                        path: ":id",
                        loadComponent() {
                            return import("../pages/crm-promotion/promotions/promotion-detail.component")
                                .then(r => r.PromotionDetailComponent)
                                .catch(handleLazyLoadError('crm-promotion/promotions/:id'))
                        }
                    }
                ]
            },





        ]
    }
]