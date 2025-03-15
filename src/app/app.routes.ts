import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProchurePageComponent } from './pages/prochure-page/prochure-page.component';
import { promotionResolver } from './resolvers/promotion/promotion.resolver';

export const routes: Routes = [
    {
        path: "prochure/:wholeCode/:promoType",
        component: ProchurePageComponent,
        resolve: { itemList: promotionResolver }
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
