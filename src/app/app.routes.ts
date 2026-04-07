import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/brochure-project/search-page/search-page.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';

// Feature routes
import { BROCHURE_ROUTES } from './routes/brochure.route';
import { CN_ROUTES } from './routes/cn.route';
import { SUPPLIER_ROUTES } from './routes/supplier.route';
import { DN_INBOUND_ROUTE, HU_INBOUND_ROUTE } from './routes/inbound.route';
import { OTHER_INCOME_ROUTES } from './routes/other-income.route';
import { STOCK_ITEM_ROUTES } from './routes/stock-item.route';
import { QUOTA_ITEM_ROUTES } from './routes/quota-item.route';
import { CRM_PROMOTION_ROUTE } from './routes/crm-promotion.route';

export const routes: Routes = [
    // Brochure & Marketing
    ...BROCHURE_ROUTES,

    // CN Project
    ...CN_ROUTES,

    // Supplier (Reserve, In-Out, Inbound)
    ...SUPPLIER_ROUTES,
    ...DN_INBOUND_ROUTE,
    ...HU_INBOUND_ROUTE,

    // Other Income
    ...OTHER_INCOME_ROUTES,

    // Stock Item
    ...STOCK_ITEM_ROUTES,

    // Quota Item
    ...QUOTA_ITEM_ROUTES,

    //Crm promotion
    ...CRM_PROMOTION_ROUTE,
    // Fallback routes
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
