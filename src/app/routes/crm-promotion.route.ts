import { Route } from "@angular/router";
import { handleLazyLoadError } from "../utils/lazy-load-error-handler";
import { CRM_PAGE_CONFIG } from "../service/crm-promotion/crm-token";
import { ProductGroupConfigService } from "../service/crm-promotion/product-group-config.service";
import { provideCreatePromotionConfig } from "../factory/crm-promotion/create-promotion";

const CREATE_ROUTE_PATH = ["create-bill", "create-category", "create-fix", "create-pick", "create-pwp"]

const CREATE_ROUTE = CREATE_ROUTE_PATH.map<Route>(r => ({
    path: r,
    providers: [
        {
            provide: CRM_PAGE_CONFIG,
            useValue: provideCreatePromotionConfig(r)
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
                loadComponent() {
                    return import("../pages/crm-promotion/crm-home/crm-home.component")
                        .then(r => r.CrmHomeComponent)
                        .catch(handleLazyLoadError('crm-promotion'))
                },
            },
            ...CREATE_ROUTE,
            // {
            //     path: "create-bill",
            //     providers: [
            //         {
            //             provide: CRM_PAGE_CONFIG,
            //             useValue: {
            //                 initialData: {
            //                     ...DEFAULT_CRM_DATA, ...CRM_BILL_VARIATION
            //                 }
            //             }
            //         }
            //     ],
            //     loadComponent() {
            //         return import("../pages/crm-promotion/create/create-bill-discount-promotion/create-bill-discount-promotion.component")
            //             .then(r => r.CreateBillDiscountPromotionComponent)
            //             .catch(handleLazyLoadError('crm-promotion/create'))
            //     }
            // },
            {
                path: "config",
                loadComponent() {
                    return import("../pages/crm-promotion/config/config-layout/config-layout.component")
                        .then(r => r.ConfigLayoutComponent)
                        .catch(handleLazyLoadError('crm-promotion/config'))

                },
                children: [
                    {
                        path: "branch",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-branch-config/create-branch-config.component")
                                .then(r => r.CreateBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config/branch'))
                        },
                    },
                    {
                        path: "branch/:branchGroupId",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/edit-branch-config/edit-branch-config.component")
                                .then(r => r.EditBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config/branch/:branchId'))
                        },
                    },
                    {
                        path: "product",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-product-config/create-product-config.component")
                                .then(r => r.CreateProductConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config/product"))
                        }
                    },
                    {
                        path: "product/:productGroupId",
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
                        path: "promotion-set",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/create-promotion-set-config/create-promotion-set-config.component")
                                .then(r => r.CreatePromotionSetConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config/promotion-set"))
                        }
                    }
                ]
            },
        ]
    }
]