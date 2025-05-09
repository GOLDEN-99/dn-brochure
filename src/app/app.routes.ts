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
import { AuthPageComponent } from './pages/supplier-project/auth-page/auth-page.component';

export const routes: Routes = [
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
                loadComponent: () => import('./pages/cn-project/cn-all/cn-all.component').then(r => r.CnAllComponent),
                canActivate: [cnGuard('whole')]
            },
            {
                path: "some",
                loadComponent: () => import('./pages/cn-project/cn-some/cn-some.component').then(r => r.CnSomeComponent),
                canActivate: [cnGuard('some')]
            },
            {
                path: "some/detail",
                loadComponent: () => import('./pages/cn-project/cn-some-detail/cn-some-detail.component').then(r => r.CnSomeDetailComponent),
                canActivate: [cnGuard('some')]
            },
            {
                path: "upload",
                loadComponent: () => import('./pages/cn-project/cn-upload/cn-upload.component').then(r => r.CnUploadComponent),
                canActivate: [cnGuard(null)]
            },
            {
                path: "complete",
                loadComponent: () => import('./pages/cn-project/cn-complete/cn-complete.component').then(r => r.CnCompleteComponent)
            }
        ]
    },
    {
        path: 'supplier',
        component: SupplierLayoutComponent,
        children: [
            {
                path: '',
                component: AuthPageComponent
            },
            {
                path: 'general',
                loadComponent: () => import('./pages/supplier-project/general-page/general-page.component').then(r => r.GeneralPageComponent)
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
