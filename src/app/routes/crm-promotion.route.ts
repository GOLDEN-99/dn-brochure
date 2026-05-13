import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Route } from "@angular/router";
import { handleLazyLoadError } from "../utils/lazy-load-error-handler";
import { CRM_PAGE_CONFIG } from "../service/crm-promotion/crm-token";
import { ProductGroupConfigService } from "../service/crm-promotion/product-group-config.service";
import { provideCreatePromotionConfig } from "../factory/crm-promotion/create-promotion";
import { CrmPromotionLayoutComponent } from "../layout/crm-promotion-layout/crm-promotion-layout.component";
import { CrmPromotionService } from "../service/crm-promotion/crm-promotion.service";

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
                            return import("../pages/crm-promotion/config/branches/list-branch-config/list-branch-config.component")
                                .then(r => r.ListBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config/branch'))
                        },
                    },
                    {
                        path: "config-branch-create",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/branches/create-branch-config/create-branch-config.component")
                                .then(r => r.CreateBranchConfigComponent)
                                .catch(handleLazyLoadError('crm-promotion/config-branch-create'))
                        },
                    },

                    {
                        path: "config-branch/:branchGroupId",
                        children: [
                            {
                                path: "",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/branches/edit-branch-config/edit-branch-config.component")
                                        .then(r => r.EditBranchConfigComponent)
                                        .catch(handleLazyLoadError('crm-promotion/config/branch/:branchId'))
                                },
                            },
                            {
                                path: "add",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/branches/add-branch-config/add-branch-config.component")
                                        .then(r => r.AddBranchConfigComponent)
                                        .catch(handleLazyLoadError('crm-promotion/config/branch/:branchId/add'))
                                },
                            },

                        ]

                    },
                    {
                        path: "config-product",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/products/list-product-config/list-product-config.component")
                                .then(r => r.ListProductConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config/product"))
                        }
                    },
                    {
                        path: "config-product-create",
                        loadComponent() {
                            return import("../pages/crm-promotion/config/products/create-product-config/create-product-config.component")
                                .then(r => r.CreateProductConfigComponent)
                                .catch(handleLazyLoadError("crm-promotion/config-product-create"))
                        }
                    },
                    {
                        path: "config-product/:productGroupId",
                        providers: [ProductGroupConfigService],
                        children: [
                            {
                                path: "",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/products/edit-product-config/edit-product-config.component")
                                        .then(r => r.EditProductConfigComponent)
                                        .catch(handleLazyLoadError("crm-promotion/config/product/:productGroupId"))
                                }
                            },
                            {
                                path: "add",
                                loadComponent() {
                                    return import("../pages/crm-promotion/config/products/add-product-config/add-product-config.component")
                                        .then(r => r.AddProductConfigComponent)
                                        .catch(handleLazyLoadError("crm-promotion/config/product/:productGroupId/add"))
                                }
                            }
                        ]
                    },
                    {
                        path: ":id",
                        loadComponent() {
                            return import("../pages/crm-promotion/promotions/promotion-detail.component")
                                .then(r => r.PromotionDetailComponent)
                                .catch(handleLazyLoadError('crm-promotion/promotions/:id'))
                        }
                    },
                    {
                        path: ":id/edit",
                        resolve: {
                            detail: (route: ActivatedRouteSnapshot) =>
                                inject(CrmPromotionService).getPromotionById(Number(route.paramMap.get('id')))
                        },
                        loadComponent() {
                            return import("../pages/crm-promotion/edit/edit-promotion.component")
                                .then(r => r.EditPromotionComponent)
                                .catch(handleLazyLoadError('crm-promotion/:id/edit'))
                        }
                    }
                ]
            },





        ]
    }
]