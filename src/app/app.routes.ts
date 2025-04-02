import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProchurePageComponent } from './pages/prochure-page/prochure-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { ExternalBrochureComponent } from './pages/external-brochure/external-brochure.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { BaseBrochureComponent } from './pages/base-brochure/base-brochure.component';
import { BROCHURE_TOKEN } from './lib';
import { ProchureService } from './service/prochure/prochure.service';
import { MarketingService } from './service/marketing/marketing.service';

export const routes: Routes = [
    {
        path: "prochure/:wholeCode/:promoType",
        component: ProchurePageComponent,
        resolve: { itemList: promotionResolver }
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        component: ExternalBrochureComponent,
        resolve: { itemList: marketingResolver },
    },
    {
        path: "v2/prochure/:wholeCode/:promoType",
        component: BaseBrochureComponent,
        resolve: { itemList: promotionResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: ProchureService }
        ]
    },
    {
        path: "v2/marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        component: BaseBrochureComponent,
        resolve: { itemList: marketingResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: MarketingService }
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
