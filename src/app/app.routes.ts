import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/brochure-project/search-page/search-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { BROCHURE_TOKEN } from './lib';
import { CnLayoutComponent } from './layout/cn-layout/cn-layout.component';
import { cnResolver } from './resolvers/cn/cn.resolver';
import { BaseBrochureComponent } from './pages/brochure-project/base-brochure/base-brochure.component';
import { CnComponent } from './pages/cn-project/cn/cn.component';
import { ProchureService } from './service/brochure/prochure/prochure.service';
import { MarketingService } from './service/brochure/marketing/marketing.service';
import { cnGuard } from './guard/cn-guard.guard';
import { SupplierLayoutComponent } from './layout/supplier-layout/supplier-layout.component';
import { SupplierDnService } from './service/supplier/supplier-dn.service';
import { SupplierHuService } from './service/supplier/supplier-hu.service';
import { SupplierReserveLayoutComponent } from './layout/supplier-reserve-layout/supplier-reserve-layout.component';
import { SupplierReserveComponent } from './pages/supplier-project/supplier-reserve/supplier-reserve.component';
import { InOutLayoutComponent } from './layout/in-out-layout/in-out-layout.component';
import { InOutViewComponent } from './pages/supplier-project/in-out-view/in-out-view.component';
import { InOutEditComponent } from './pages/supplier-project/in-out-edit/in-out-edit.component';
import { InOutListComponent } from './pages/supplier-project/in-out-list/in-out-list.component';
import { RegisterPageComponent } from './pages/supplier-project/register-page/register-page.component';
import { getByWarehouseResolver } from './resolvers/Ibob/get-by-warehouse.resolver';
import { InOutNavComponent } from './layout/in-out-nav/in-out-nav.component';
import { InOutQueryComponent } from './pages/supplier-project/in-out-query/in-out-query.component';
import { FlashSaleComponent } from './pages/brochure-project/flash-sale/flash-sale.component';
import { flashSaleResolver } from './resolvers/flash-sale/flash-sale.resolver';
import { InOutAddComponent } from './pages/supplier-project/in-out-add/in-out-add.component';
import { InOutDetailComponent } from './pages/supplier-project/in-out-detail/in-out-detail.component';
import { fetchDoorDetailResolver } from './resolvers/Ibob/fetch-door-detail.resolver';
import { SUPPLIER_TOKEN } from './service/supplier/supplier.token';


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
            { provide: BROCHURE_TOKEN, useExisting: ProchureService }
        ]
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        component: BaseBrochureComponent,
        resolve: { itemList: marketingResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: MarketingService }
        ]
    },
    {
        path: "cn/:saleCode/:wholeCode/:wholeNumb",
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
        path: 'supplier/form/product',
        loadComponent: () => import('./pages/supplier-project/supplier-product-page/supplier-product-page.component')
            .then(r => r.SupplierProductPageComponent)
    },
    {
        path: 'supplier/form',
        component: SupplierLayoutComponent,
        children: [
            {
                path: '',
                component: RegisterPageComponent
            },
            {
                path: 'general',
                loadComponent: () =>
                    import('./pages/supplier-project/general-page/general-page.component')
                        .then(r => r.GeneralPageComponent)
            },
            {
                path: 'final',
                loadComponent: () =>
                    import('./pages/supplier-project/step-three-page/step-three-page.component')
                        .then(r => r.StepThreePageComponent)
            },
            {
                path: 'condition',
                loadComponent: () =>
                    import('./pages/supplier-project/condition-page/condition-page.component')
                        .then(r => r.ConditionPageComponent)
            }
        ]
    },
    {
        path: 'supplier/reserve',
        component: SupplierReserveLayoutComponent,
        children: [
            {
                path: "",
                component: SupplierReserveComponent
            },
            {
                path: "add/:warehouse",
                resolve: [getByWarehouseResolver],
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
                        component: InOutDetailComponent,
                        resolve: [fetchDoorDetailResolver]
                    },
                    {
                        path: 'list/:doorId/edit',
                        component: InOutEditComponent,
                        resolve: [fetchDoorDetailResolver]
                    },
                    {
                        path: 'query',
                        component: InOutQueryComponent
                    }
                ]
            }
        ]
    },
    {
        path: 'supplier/dn',
        title: 'DN Inhouse',
        loadComponent: () =>
            import('./pages/supplier-project/supplier-inhouse/supplier-inhouse.component')
                .then(r => r.SupplierInhouseComponent),
        providers: [
            { provide: SUPPLIER_TOKEN, useExisting: SupplierDnService }
        ]
    },
    {
        path: 'supplier/hu',
        title: 'HU Inhouse',
        loadComponent: () =>
            import('./pages/supplier-project/supplier-inhouse/supplier-inhouse.component')
                .then(r => r.SupplierInhouseComponent),
        providers: [
            { provide: SUPPLIER_TOKEN, useExisting: SupplierHuService }
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
