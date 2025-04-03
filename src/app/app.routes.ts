import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { BaseBrochureComponent } from './pages/base-brochure/base-brochure.component';
import { BROCHURE_TOKEN } from './lib';
import { ProchureService } from './service/prochure/prochure.service';
import { MarketingService } from './service/marketing/marketing.service';
import { CnComponent } from './pages/cn/cn.component';
import { CnLayoutComponent } from './layout/cn-layout/cn-layout.component';

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
        path: "cn",
        component: CnLayoutComponent,
        children: [
            {
                path: "",
                component: CnComponent
            },
            {
                path: "all",
                loadComponent: () => import('./pages/cn-all/cn-all.component').then(r => r.CnAllComponent)
            },
            {
                path: "some",
                loadComponent: () => import('./pages/cn-some/cn-some.component').then(r => r.CnSomeComponent)
            },
            {
                path: "upload",
                loadComponent: () => import('./pages/cn-upload/cn-upload.component').then(r => r.CnUploadComponent)
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
