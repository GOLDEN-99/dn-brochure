import { Routes } from '@angular/router';
import { NotfoundComponent } from './pages/notfound/notfound.component';
// Feature routes
//already review
import { BROCHURE_ROUTES } from './brochure/routes';
import { CN_ROUTES } from './cn/routes/cn.route';
// wait for review
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
