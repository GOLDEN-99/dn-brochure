import { Route } from '@angular/router';
import { PURCHASE_ROUTES } from '../purchase/purchase.routes';
import { ACCOUNT_ROUTES } from '../account/account.routes';
import { OtherIncomeEmplGateComponent } from '../shared/components/other-income-empl-gate/other-income-empl-gate.component';
import { otherIncomeEmplAuthGuard } from '../shared/guards/other-income-empl-auth.guard';

export const OTHER_INCOME_ROUTES: Route[] = [
    {
        path: 'v2/other-income',
        title: 'รายได้อื่นๆ',
        component: OtherIncomeEmplGateComponent,
        canActivate: [otherIncomeEmplAuthGuard],
        children: [
            PURCHASE_ROUTES,
            ACCOUNT_ROUTES,
        ]
    },
];
