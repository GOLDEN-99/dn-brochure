import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/brochure-project/search-page/search-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { BROCHURE_TOKEN } from './lib';
import { ProchureService } from './service/prochure/prochure.service';
import { MarketingService } from './service/marketing/marketing.service';
import { CnLayoutComponent } from './layout/cn-layout/cn-layout.component';
import { cnResolver } from './resolvers/cn/cn.resolver';
import { BaseBrochureComponent } from './pages/brochure-project/base-brochure/base-brochure.component';
import { CnComponent } from './pages/cn-project/cn/cn.component';

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
                loadComponent: () => import('./pages/cn-project/cn-all/cn-all.component').then(r => r.CnAllComponent)
            },
            {
                path: "some",
                loadComponent: () => import('./pages/cn-project/cn-some/cn-some.component').then(r => r.CnSomeComponent)
            },
            {
                path: "some/detail",
                loadComponent: () => import('./pages/cn-project/cn-some-detail/cn-some-detail.component').then(r => r.CnSomeDetailComponent)
            },
            {
                path: "upload",
                loadComponent: () => import('./pages/cn-project/cn-upload/cn-upload.component').then(r => r.CnUploadComponent)
            },
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
