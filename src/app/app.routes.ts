import { Routes } from '@angular/router';
import { NotfoundComponent } from './pages/notfound/notfound.component';
// Feature routes
//already review
import { BROCHURE_ROUTES } from './brochure/routes';
import { CN_ROUTES } from './cn/routes/cn.route';
import { SUPPLIER_ROUTES } from './routes/supplier.route';
import { DN_INBOUND_ROUTE, HU_INBOUND_ROUTE } from './routes/inbound.route';
import { OTHER_INCOME_ROUTES as OTHER_INCOME_ROUTES_V1 } from './routes/other-income.route';
import { OTHER_INCOME_ROUTES as OTHER_INCOME_ROUTES_V2 } from './other-income/routes/other-income.route'
import { STOCK_ITEM_ROUTES } from './routes/stock-item.route';
import { QUOTA_ITEM_ROUTES } from './routes/quota-item.route';
import { CRM_PROMOTION_ROUTE } from './routes/crm-promotion.route';

// Single toggle for which Other Income implementation is mounted — both
// versions register routes under the same 'other-income' path, so exactly
// one must be active at a time.
// const OTHER_INCOME_ROUTES = OTHER_INCOME_ROUTES_V2;

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
    ...OTHER_INCOME_ROUTES_V1,
    ...OTHER_INCOME_ROUTES_V2,

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
    // {
    //     path: "",
    //     pathMatch: "full",
    //     component: SearchPageComponent
    // },
    {
        path: "**",
        component: NotfoundComponent
    }
];
