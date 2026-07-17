import { Route } from '@angular/router';
import { PURCHASE_ROUTES } from '../purchase/purchase.routes';
import { ACCOUNT_ROUTES } from '../account/account.routes';

export const OTHER_INCOME_ROUTES: Route[] = [
    {
        path: 'v2/other-income',
        title: 'รายได้อื่นๆ',
        children: [
            PURCHASE_ROUTES,
            ACCOUNT_ROUTES,
        ]
    },
];
