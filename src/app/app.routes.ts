import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProchurePageComponent } from './pages/prochure-page/prochure-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';
import { marketingResolver } from './resolvers/marketing/marketing.resolver';
import { ExternalBrochureComponent } from './pages/external-brochure/external-brochure.component';

export const routes: Routes = [
    {
        path: "prochure/:wholeCode/:promoType",
        component: ProchurePageComponent,
        resolve: { itemList: promotionResolver }
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token",
        component: ExternalBrochureComponent,
        resolve: { itemList: marketingResolver },
    },
    {
        path: "",
        pathMatch: "full",
        component: SearchPageComponent
    },
    {
        path: "**",
        redirectTo: ""
    }
];
