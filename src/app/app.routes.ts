import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/brochure-project/search-page/search-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { BROCHURE_PRICE_TYPE_TOKEN, BROCHURE_TOKEN, OTHER_INCOME_PAGE_TOKEN } from './lib';
import { CnLayoutComponent } from './layout/cn-layout/cn-layout.component';
import { cnResolver } from './resolvers/cn/cn.resolver';
import { BaseBrochureComponent } from './pages/brochure-project/base-brochure/base-brochure.component';
import { CnComponent } from './pages/cn-project/cn/cn.component';
import { ProchureService } from './service/brochure/prochure/prochure.service';
import { MarketingService } from './service/brochure/marketing/marketing.service';
import { cnGuard } from './guard/cn-guard.guard';

import { SupplierReserveLayoutComponent } from './layout/supplier-reserve-layout/supplier-reserve-layout.component';
import { SupplierReserveComponent } from './pages/supplier-project/supplier-reserve/supplier-reserve.component';
import { InOutLayoutComponent } from './layout/in-out-layout/in-out-layout.component';
import { InOutViewComponent } from './pages/supplier-project/in-out-view/in-out-view.component';
import { InOutEditComponent } from './pages/supplier-project/in-out-edit/in-out-edit.component';
import { InOutListComponent } from './pages/supplier-project/in-out-list/in-out-list.component';

import { getByWarehouseResolver } from './resolvers/Ibob/get-by-warehouse.resolver';
import { InOutNavComponent } from './layout/in-out-nav/in-out-nav.component';
import { InOutAddComponent } from './pages/supplier-project/in-out-add/in-out-add.component';
import { InOutDetailComponent } from './pages/supplier-project/in-out-detail/in-out-detail.component';
import { fetchDoorDetailResolver } from './resolvers/Ibob/fetch-door-detail.resolver';

import { InOutQueryComponent } from './pages/supplier-project/in-out-query/in-out-query.component';
import { flashSaleResolver } from './resolvers/flash-sale/flash-sale.resolver';

import { ACCOUNT_TAB_TOKEN, PURCHASE_TAB_TOKEN, PurchaseLayoutComponent, TAB_TOKEN } from './layout/other-income/purchase-layout/purchase-layout.component';
import { PurchaseHomeComponent } from './pages/other-income/purchase/purchase-home/purchase-home.component';
import { PurchaseReportComponent } from './pages/other-income/purchase/purchase-report/purchase-report.component';
import { PurchaseIncomeFormComponent } from './pages/other-income/purchase/purchase-income-form/purchase-income-form.component';
import { PurchaseTemplateComponent } from './components/other-income/purchase-template/purchase-template.component';
import { SpecialIncomeFormComponent } from './pages/other-income/purchase/special-income-form/special-income-form.component';

import { OtherIncomeReportComponent } from './pages/other-income/other-income-report/other-income-report.component';
import { BaseLayoutComponent, LABEL_TOKEN } from './layout/other-income/base-layout/base-layout.component';
import { OtherIncomeLightFormComponent } from './components/other-income/form/other-income-light-form/other-income-light-form.component';
import { OtherIncomeNotLightFormComponent } from './components/other-income/form/other-income-not-light-form/other-income-not-light-form.component';
import { PurchasingLightHomeComponent } from './pages/other-income/purchase/purchasing-light-home/purchasing-light-home.component';
import { getOtherIncomeLightIdResolver } from './resolvers/other-income/get-other-income-light-id.resolver';
import { getOtherIncomeNotLightIdResolver } from './resolvers/other-income/get-other-income-not-light-id.resolver';
import { NotLightSingleComponent } from './pages/other-income/purchase/not-light-single/not-light-single.component';
import { LightSingleComponent } from './pages/other-income/purchase/light-single/light-single.component';
import { AccountNotLightInvoiceComponent } from './pages/other-income/account/account-not-light-invoice.component';
import { AccountNotLightProductComponent } from './pages/other-income/account/account-not-light-product.component';
import { AccountLightBoxComponent } from './pages/other-income/account/account-light-box.component';
import { FlashSaleComponent } from './pages/brochure-project/flash-sale/flash-sale.component';

import { DN_INBOUND_ROUTE, HU_INBOUND_ROUTE } from './routes/inbound.route';
import { ibobLoginGuardGuard } from './guard/ibob-login-guard.guard';


export const routes: Routes = [
    {
        path: 'flash-sale/:zone/:idPromotion',
        component: FlashSaleComponent,
        resolve: { fs: flashSaleResolver }
    },
    {
        path: "prochure/:wholeCode/:promoType",
        component: BaseBrochureComponent,
        resolve: { itemList: promotionResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: ProchureService },
            { provide: BROCHURE_PRICE_TYPE_TOKEN, useValue: { priceType: 'price' } }
        ]
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        component: BaseBrochureComponent,
        resolve: { itemList: marketingResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: MarketingService },
            { provide: BROCHURE_PRICE_TYPE_TOKEN, useValue: { priceType: 'priceGold' } }
        ]
    },
    // cn
    {
        path: "cn/:saleCode/:wholeCode/:wholeNumb/:isWRR",
        component: CnLayoutComponent,
        resolve: { wholeItem: cnResolver },
        children: [
            {
                path: "",
                component: CnComponent
            },
            {
                path: "whole",
                loadComponent: () =>
                    import('./pages/cn-project/cn-all/cn-all.component')
                        .then(r => r.CnAllComponent),
                canActivate: [cnGuard('whole')]
            },
            {
                path: "some",
                loadComponent: () =>
                    import('./pages/cn-project/cn-some/cn-some.component')
                        .then(r => r.CnSomeComponent),
                canActivate: [cnGuard('some')]
            },
            {
                path: "some/detail",
                loadComponent: () =>
                    import('./pages/cn-project/cn-some-detail/cn-some-detail.component')
                        .then(r => r.CnSomeDetailComponent),
                canActivate: [cnGuard('some')]
            },
            {
                path: "upload",
                loadComponent: () =>
                    import('./pages/cn-project/cn-upload/cn-upload.component')
                        .then(r => r.CnUploadComponent),
                canActivate: [cnGuard(null)]
            },
            {
                path: "complete",
                loadComponent: () =>
                    import('./pages/cn-project/cn-complete/cn-complete.component')
                        .then(r => r.CnCompleteComponent)
            }
        ]
    },
    {
        path: 'supplier/reserve',
        title: 'SUPPLIER RESERVATION',
        component: SupplierReserveLayoutComponent,
        children: [
            {
                path: "",
                canActivate: [ibobLoginGuardGuard],
                component: SupplierReserveComponent
            },
            {
                path: "add/:warehouse",
                resolve: [getByWarehouseResolver],
                canActivate: [ibobLoginGuardGuard],
                loadComponent: () => import('./pages/supplier-project/supplier-reserve-add/supplier-reserve-add.component')
                    .then(r => r.SupplierReserveAddComponent)
            },
            {
                path: 'login',
                loadComponent: () => import('./pages/supplier-project/supplier-login/supplier-login.component')
                    .then(r => r.SupplierLoginComponent)
            }
        ]
    },
    {
        path: 'supplier/in-out',
        component: InOutNavComponent,
        title: 'INBOUND OUTBOUND',
        children: [
            {
                path: ':warehouse',
                resolve: [getByWarehouseResolver],
                component: InOutLayoutComponent,
                children: [
                    {
                        path: '',
                        component: InOutViewComponent
                    },
                    {
                        path: 'list',
                        component: InOutListComponent
                    },
                    {
                        path: 'list/add',
                        component: InOutAddComponent
                    },
                    {
                        path: 'list/:doorId',
                        resolve: [fetchDoorDetailResolver],
                        children: [
                            {
                                path: '',
                                component: InOutDetailComponent
                            },
                            {
                                path: 'edit',
                                component: InOutEditComponent
                            }
                        ]
                    },
                    {
                        path: 'query',
                        component: InOutQueryComponent
                    },
                    {
                        path: 'add',
                        loadComponent: () => import("./pages/supplier-project/ibob-admin-add/ibob-admin-add.component")
                            .then(r => r.IbobAdminAddComponent)
                            .catch((err) => NotfoundComponent),
                    },
                    {
                        path: ':reserveId',
                        loadComponent: () => import("./pages/supplier-project/ibob-admin-edit/ibob-admin-edit.component")
                            .then(r => r.IbobAdminEditComponent)
                            .catch((err) => NotfoundComponent),
                    }
                ]
            }
        ]
    },
    ...DN_INBOUND_ROUTE,
    ...HU_INBOUND_ROUTE,
    {
        path: 'other-income',
        title: 'รายได้อื่นๆ',
        children: [
            {
                path: 'purchase',
                component: PurchaseLayoutComponent,
                providers: [
                    {
                        provide: TAB_TOKEN,
                        useValue: PURCHASE_TAB_TOKEN
                    }
                ],
                children: [
                    {
                        path: 'not-light',
                        component: PurchaseHomeComponent
                    },
                    {
                        path: 'light',
                        component: PurchasingLightHomeComponent
                    },
                    {
                        path: 'report',
                        component: PurchaseReportComponent
                    }
                ]
            },
            {
                path: 'purchase/not-light/create',
                component: BaseLayoutComponent,
                providers: [
                    {
                        provide: LABEL_TOKEN,
                        useValue: { label: "รายได้อื่นๆ" }
                    }
                ],
                children: [
                    {
                        path: "",
                        component: PurchaseIncomeFormComponent
                    },
                    {
                        path: ":headId",
                        component: OtherIncomeNotLightFormComponent
                    }
                ]
            },
            {
                path: 'purchase/light/create',
                component: BaseLayoutComponent,
                providers: [
                    {
                        provide: LABEL_TOKEN,
                        useValue: { label: "รายได้อื่นๆ light box" }
                    },
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: true }
                    }
                ],
                children: [
                    {
                        path: "",
                        component: SpecialIncomeFormComponent
                    },
                    {
                        path: ":headId",
                        component: OtherIncomeLightFormComponent
                    }
                ]
            },
            {
                path: 'purchase/light/:headId',
                resolve: { single: getOtherIncomeLightIdResolver },
                providers: [
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: true }
                    }
                ],
                component: LightSingleComponent
            },
            {
                path: 'purchase/not-light/:headId',
                resolve: { single: getOtherIncomeNotLightIdResolver },
                providers: [
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: true }
                    }
                ],
                component: NotLightSingleComponent
            },
            {
                path: "account",
                component: PurchaseLayoutComponent,
                providers: [
                    {
                        provide: TAB_TOKEN,
                        useValue: ACCOUNT_TAB_TOKEN
                    },
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: false }
                    }
                ],
                children: [
                    {
                        path: 'not-light',
                        component: AccountNotLightInvoiceComponent
                    },
                    {
                        path: 'not-light-product',
                        component: AccountNotLightProductComponent
                    },
                    {
                        path: 'light',
                        component: AccountLightBoxComponent
                    },
                    {
                        path: 'report',
                        component: OtherIncomeReportComponent
                    }
                ]
            },
            {
                path: 'account/light/:headId',
                resolve: { single: getOtherIncomeLightIdResolver },
                providers: [
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: false }
                    }
                ],
                component: LightSingleComponent
            },
            {
                path: 'account/not-light/:headId',
                resolve: { single: getOtherIncomeNotLightIdResolver },
                providers: [
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: false }
                    }
                ],
                component: NotLightSingleComponent
            },
            // {
            //     path: 'account/not-light-product/:headId',
            //     resolve: { single: getOtherIncomeNotLightIdResolver },
            //     component: NotLightSingleComponent
            // },
            {
                path: "account/:id",
                component: PurchaseTemplateComponent
            },
            {
                path: "report/:year",
                component: OtherIncomeReportComponent
            }
        ]
    },
    {
        path: "notfound",
        component: NotfoundComponent
    },
    {
        path: "",
        pathMatch: "full",
        component: SearchPageComponent
    },
    {
        path: "**",
        component: NotfoundComponent
    }
];
