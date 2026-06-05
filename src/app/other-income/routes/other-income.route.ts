import { Route } from '@angular/router';
import { handleLazyLoadError } from '../../utils/lazy-load-error-handler';
import { InjectionToken } from '@angular/core';
import { OtherIncomeHomeLayoutComponent } from '../shared/components/layout/other-income-home-layout/other-income-home-layout.component';

type TTabItem = {
    label: string
    link: string
    exact: boolean
}
export interface ITabSetting {
    tabList: TTabItem[]
}

export const TAB_TOKEN = new InjectionToken<ITabSetting>('TAB_SETTING_TOKEN');

export const PURCHASE_TAB_TOKEN: ITabSetting = {
    tabList: [
        {
            label: 'รายได้อื่นๆ',
            link: './dc-rebate',
            exact: true
        },
        {
            label: 'รายได้อื่นๆ light-box',
            link: './light',
            exact: false
        },
        {
            label: 'รายได้อื่นๆ 2 หัว',
            link: './not-light-dual',
            exact: false
        },
        {
            label: 'รายงานใหม่',
            link: './monthly-report',
            exact: false
        },
        {
            label: 'รายงานเดิม',
            link: './report',
            exact: false
        }
    ]
}

export const ACCOUNT_TAB_TOKEN: ITabSetting = {
    tabList: [
        {
            label: 'รายได้อื่นๆ',
            link: './not-light',
            exact: false
        },
        {
            label: 'รายได้อื่นๆ light-box',
            link: './light',
            exact: false
        },
        // {
        //   label: 'รายได้อื่นๆ รับรู้จากสินค้า',
        //   link: './not-light-product',
        //   exact: false
        // },
        {
            label: 'รายงานใหม่',
            link: './monthly-report',
            exact: false
        },
        {
            label: 'รายงานเดิม',
            link: './report',
            exact: false
        },
        {
            label: 'ตรวจใบแจ้งหนี้',
            link: 'invoices',
            exact: false
        }

    ]
}

export const NOTLIGHT_PRODUCT_TAB_TOKEN = {
    tabList: [
        {
            label: 'รายละเอียด',
            link: '',
            exact: true
        },
        {
            label: 'รายเดือน',
            link: './monthly',
            exact: false
        },
        {
            label: 'ราย period',
            link: './period-order',
            exact: false
        }
    ]
}

export const NOTLIGHT_INVOICE_TAB_TOKEN = {
    tabList: [
        {
            label: 'รายละเอียด',
            link: '',
            exact: true
        },
        {
            label: 'รายเดือน',
            link: './monthly',
            exact: false
        },
        {
            label: 'ราย period',
            link: './period-invoice',
            exact: false
        }
    ]
}

export const LIGHT_TAB_TOKEN = {
    tabList: [
        {
            label: 'รายละเอียด',
            link: '',
            exact: true
        },
        {
            label: 'รายเดือน',
            link: './monthly',
            exact: false
        },
        {
            label: 'ราย period',
            link: './period-invoice',
            exact: false
        }
    ]
}

export const STOCK_ITEM_TOKEN = {
    tabList: [
        {
            label: 'เกณฑ์เดือนสั่งซื้อ',
            link: './',
            exact: true
        },
        {
            label: 'รายงาน',
            link: './report',
            exact: true
        },
    ]
}

export const QUOTA_ITEM_TOKEN = {
    tabList: [
        {
            label: 'เพิ่มโควต้า',
            link: './',
            exact: true
        },
        {
            label: 'รายการโควต้า',
            link: './good-list',
            exact: true
        },
        {
            label: 'โควต้ารายร้าน',
            link: './whole-list',
            exact: true
        }
    ]
}

export const OTHER_INCOME_ROUTES: Route[] = [
    {
        path: 'v2/other-income',
        title: 'รายได้อื่นๆ',
        children: [
            {
                path: 'purchase',
                component: OtherIncomeHomeLayoutComponent,
                // providers: [
                //     {
                //         provide: TAB_TOKEN,
                //         useValue: PURCHASE_TAB_TOKEN
                //     }
                // ],
                children: [
                    {
                        path: 'dc-rebate',
                        loadComponent: () => import('../purchase/components/pages/dc-rebate-home-page/dc-rebate-home-page.component')
                            .then(c => c.DcRebateHomePageComponent)
                            .catch(handleLazyLoadError('purchase dc rebate home'))
                    },
                    // {
                    //     path: 'light-box',
                    //     loadComponent: () => import('../purchase/components/pages/light-box-home-page/light-box-home-page.component')
                    //         .then(c => c.LightBoxHomePageComponent)
                    //         .catch(handleLazyLoadError('purchase light box home'))
                    // },
                    // {
                    //     path: 'incentive',
                    //     loadComponent: () => import('../purchase/components/pages/incentive-home-page/incentive-home-page.component')
                    //         .then(c => c.IncentiveHomePageComponent)
                    //         .catch(handleLazyLoadError('purchase incentive home'))
                    // },
                    // {
                    //     path: 'report',
                    //     component: PurchaseReportComponent
                    // },
                    // {
                    //     path: 'not-light-dual',
                    //     component: NotLightSingleDualComponent
                    // },
                    // {
                    //     path: 'monthly-report',
                    //     component: AccountMonthlyReportComponent
                    //},
                    // {
                    //     path: '**',
                    //     redirectTo: 'dc-rebate'
                    // }
                ]
            },
            // {
            //     path: 'purchase/not-light/create',
            //     component: BaseLayoutComponent,
            //     providers: [
            //         {
            //             provide: LABEL_TOKEN,
            //             useValue: { label: "รายได้อื่นๆ" }
            //         }
            //     ],
            //     children: [
            //         {
            //             path: "",
            //             component: PurchaseIncomeFormComponent
            //         },
            //         {
            //             path: ":headId",
            //             component: OtherIncomeNotLightFormComponent
            //         }
            //     ]
            // },
            // {
            //     path: 'purchase/light/create',
            //     component: BaseLayoutComponent,
            //     providers: [
            //         {
            //             provide: LABEL_TOKEN,
            //             useValue: { label: "รายได้อื่นๆ light box" }
            //         },
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: true }
            //         }
            //     ],
            //     children: [
            //         {
            //             path: "",
            //             component: SpecialIncomeFormComponent
            //         },
            //         {
            //             path: ":headId",
            //             component: OtherIncomeLightFormComponent
            //         }
            //     ]
            // },
            // {
            //     path: 'purchase/light/:headId',
            //     resolve: { single: getOtherIncomeLightIdResolver },
            //     providers: [
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: true }
            //         }
            //     ],
            //     component: LightSingleComponent
            // },
            // {
            //     path: 'purchase/not-light/:headId',
            //     resolve: { single: getOtherIncomeNotLightIdResolver },
            //     providers: [
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: true }
            //         }
            //     ],
            //     component: NotLightSingleComponent
            // },
            // {
            //     path: 'purchase/not-light-dual/:dualPairId',
            //     resolve: { detail: getOtherIncomeNotLightDualIdResolver },
            //     providers: [
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: true }
            //         }
            //     ],
            //     component: NotLightDualDetailComponent
            // },
            // {
            //     path: "account",
            //     component: PurchaseLayoutComponent,
            //     providers: [
            //         {
            //             provide: TAB_TOKEN,
            //             useValue: ACCOUNT_TAB_TOKEN
            //         },
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: false }
            //         }
            //     ],
            //     children: [
            //         {
            //             path: 'not-light',
            //             component: AccountNotLightInvoiceComponent
            //         },
            //         {
            //             path: 'light',
            //             component: AccountLightBoxComponent
            //         },
            //         {
            //             path: 'report',
            //             component: OtherIncomeReportComponent
            //         },
            //         {
            //             path: 'monthly-report',
            //             component: AccountMonthlyReportComponent
            //         },
            //         // {
            //         //     path: 'batch',
            //         //     loadComponent: () => import("../pages/other-income/account/other-income-account-batch/other-income-account-batch.component")
            //         //         .then(r => r.OtherIncomeAccountBatchComponent)
            //         //         .catch(handleLazyLoadError('other-income/account/batch'))
            //         // }
            //     ]
            // },
            // {
            //     path: 'account/light/:headId',
            //     resolve: { single: getOtherIncomeLightIdResolver },
            //     providers: [
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: false }
            //         }
            //     ],
            //     component: LightSingleComponent
            // },
            // {
            //     path: 'account/not-light/:headId',
            //     resolve: { single: getOtherIncomeNotLightIdResolver },
            //     providers: [
            //         {
            //             provide: OTHER_INCOME_PAGE_TOKEN,
            //             useValue: { isPurchase: false }
            //         }
            //     ],
            //     component: NotLightSingleComponent
            // },
            // {
            //     path: "report/:year",
            //     component: OtherIncomeReportComponent
            // }
        ]
    },
];
