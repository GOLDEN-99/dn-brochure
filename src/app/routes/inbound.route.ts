import { Route } from "@angular/router";

import { SupplierApiService } from "../service/supplier/supplier-api.service";
import { SupplierLayoutComponent } from "../layout/supplier-layout/supplier-layout.component";
import { supplierCompResolver } from "../resolvers/ibob/supplier-comp.resolver";
import { SupplierFormViewComponent } from "../pages/supplier-project/supplier-form-view/supplier-form-view.component";


export const DN_INBOUND_ROUTE: Route[] = [
    {
        path: 'supplier/dn',
        title: 'DN INHOUSE',
        providers: [
            {
                provide: SupplierApiService,
                useFactory: () => new SupplierApiService('DN'),
            }
        ],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('../pages/supplier-project/supplier-inhouse/supplier-inhouse.component')
                        .then(r => r.SupplierInhouseComponent), // handle api generated comp code to form in this level
            },
            {
                path: 'form',
                component: SupplierLayoutComponent,
                children: [
                    {
                        path: '',
                        loadComponent: () => import('../pages/supplier-project/register-page/register-page.component')
                            .then(r => r.RegisterPageComponent)
                    },
                    {
                        path: 'product',
                        loadComponent: () => import('../pages/supplier-project/supplier-product-page/supplier-product-page.component')
                            .then(r => r.SupplierProductPageComponent)
                    },
                    {
                        path: 'complete',
                        loadComponent: () =>
                            import('../pages/supplier-project/supplier-complete/supplier-complete.component')
                                .then(r => r.SupplierCompleteComponent)
                    }
                ]
            },
            {
                path: ':compCode',
                component: SupplierLayoutComponent,
                resolve: [supplierCompResolver], // pre-fetch comp info by id
                children: [
                    {
                        path: '',
                        component: SupplierFormViewComponent // handle api generated comp code to form in this level
                    },
                    {
                        path: 'product',
                        loadComponent: () =>
                            import('../pages/supplier-project/supplier-product-page/supplier-product-page.component')
                                .then(r => r.SupplierProductPageComponent)
                    }
                ]
            }
        ]
    },
]

export const HU_INBOUND_ROUTE: Route[] = [
    {
        path: 'supplier/hu',
        title: 'HU INHOUSE',
        providers: [
            {
                provide: SupplierApiService,
                useFactory: () => new SupplierApiService('HU'),
            }
        ],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('../pages/supplier-project/supplier-inhouse/supplier-inhouse.component')
                        .then(r => r.SupplierInhouseComponent),
            },
            {
                path: 'form',
                component: SupplierLayoutComponent,
                children: [
                    {
                        path: '',
                        loadComponent: () => import('../pages/supplier-project/register-page/register-page.component')
                            .then(r => r.RegisterPageComponent)
                    },
                    {
                        path: 'product',
                        loadComponent: () => import('../pages/supplier-project/supplier-product-page/supplier-product-page.component')
                            .then(r => r.SupplierProductPageComponent)
                    },
                    {
                        path: 'complete',
                        loadComponent: () =>
                            import('../pages/supplier-project/supplier-complete/supplier-complete.component')
                                .then(r => r.SupplierCompleteComponent)
                    }
                ]
            },
            {
                path: ':compCode',
                component: SupplierLayoutComponent,
                resolve: [supplierCompResolver],
                children: [
                    {
                        path: '',
                        component: SupplierFormViewComponent
                    },
                    {
                        path: 'condition',
                        loadComponent: () =>
                            import('../pages/supplier-project/condition-page/condition-page.component')
                                .then(r => r.ConditionPageComponent)
                    },
                    {
                        path: 'product',
                        loadComponent: () =>
                            import('../pages/supplier-project/supplier-product-page/supplier-product-page.component')
                                .then(r => r.SupplierProductPageComponent)
                    }
                ]
            }
        ]
    },
]