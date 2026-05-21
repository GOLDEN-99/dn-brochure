import { Route } from '@angular/router';
import { OTHER_INCOME_PAGE_TOKEN } from '../lib';
import { ACCOUNT_TAB_TOKEN, PURCHASE_TAB_TOKEN, PurchaseLayoutComponent, TAB_TOKEN } from '../layout/other-income/purchase-layout/purchase-layout.component';
import { PurchaseHomeComponent } from '../pages/other-income/purchase/purchase-home/purchase-home.component';
import { PurchaseReportComponent } from '../pages/other-income/purchase/purchase-report/purchase-report.component';
import { PurchaseIncomeFormComponent } from '../pages/other-income/purchase/purchase-income-form/purchase-income-form.component';
import { SpecialIncomeFormComponent } from '../pages/other-income/purchase/special-income-form/special-income-form.component';
import { OtherIncomeReportComponent } from '../pages/other-income/other-income-report/other-income-report.component';
import { BaseLayoutComponent, LABEL_TOKEN } from '../layout/other-income/base-layout/base-layout.component';
import { OtherIncomeLightFormComponent } from '../components/other-income/form/other-income-light-form/other-income-light-form.component';
import { OtherIncomeNotLightFormComponent } from '../components/other-income/form/other-income-not-light-form/other-income-not-light-form.component';
import { PurchasingLightHomeComponent } from '../pages/other-income/purchase/purchasing-light-home/purchasing-light-home.component';
import { getOtherIncomeLightIdResolver } from '../resolvers/other-income/get-other-income-light-id.resolver';
import { getOtherIncomeNotLightIdResolver } from '../resolvers/other-income/get-other-income-not-light-id.resolver';
import { NotLightSingleComponent } from '../pages/other-income/purchase/not-light-single/not-light-single.component';
import { NotLightSingleDualComponent } from '../pages/other-income/purchase/not-light-single-dual/not-light-single-dual.component';
import { LightSingleComponent } from '../pages/other-income/purchase/light-single/light-single.component';
import { AccountNotLightInvoiceComponent } from '../pages/other-income/account/account-not-light-invoice.component';
import { AccountLightBoxComponent } from '../pages/other-income/account/account-light-box.component';
import { handleLazyLoadError } from '../utils/lazy-load-error-handler';
import { NotLightDualDetailComponent } from '../pages/other-income/purchase/not-light-dual-detail/not-light-dual-detail.component';
import { getOtherIncomeNotLightDualIdResolver } from '../resolvers/other-income/get-other-income-not-light-dual-id.resolver';
import { AccountMonthlyReportComponent } from '../pages/other-income/account/account-monthly-report/account-monthly-report.component';

export const OTHER_INCOME_ROUTES: Route[] = [
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
                    },
                    {
                        path: 'not-light-dual',
                        component: NotLightSingleDualComponent
                    },
                    {
                        path: 'monthly-report',
                        component: AccountMonthlyReportComponent
                    },
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
                path: 'purchase/not-light-dual/:dualPairId',
                resolve: { detail: getOtherIncomeNotLightDualIdResolver },
                providers: [
                    {
                        provide: OTHER_INCOME_PAGE_TOKEN,
                        useValue: { isPurchase: true }
                    }
                ],
                component: NotLightDualDetailComponent
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
                        path: 'light',
                        component: AccountLightBoxComponent
                    },
                    {
                        path: 'report',
                        component: OtherIncomeReportComponent
                    },
                    {
                        path: 'monthly-report',
                        component: AccountMonthlyReportComponent
                    },
                    {
                        path: 'batch',
                        loadComponent: () => import("../pages/other-income/account/other-income-account-batch/other-income-account-batch.component")
                            .then(r => r.OtherIncomeAccountBatchComponent)
                            .catch(handleLazyLoadError('other-income/account/batch'))
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
            {
                path: "report/:year",
                component: OtherIncomeReportComponent
            }
        ]
    },
];
