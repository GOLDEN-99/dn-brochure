import { Route } from '@angular/router';
import { PurchaseLayoutComponent, STOCK_ITEM_TOKEN, TAB_TOKEN } from '../layout/other-income/purchase-layout/purchase-layout.component';
import { stockSetupResolver } from '../resolvers/stock-item/stock-setup.resolver';
import { StockItemReportComponent } from '../pages/stock-item/stock-item-report/stock-item-report.component';
import { handleLazyLoadError, lazyLoadWithRetry } from '../utils/lazy-load-error-handler';

export const STOCK_ITEM_ROUTES: Route[] = [
    {
        path: 'stock-item',
        component: PurchaseLayoutComponent,
        providers: [
            {
                provide: TAB_TOKEN,
                useValue: STOCK_ITEM_TOKEN
            }
        ],
        children: [
            {
                path: '',
                loadComponent: () => lazyLoadWithRetry(() => import('../pages/stock-item/stock-item-home/stock-item-home.component'))
                    .then(r => r.StockItemHomeComponent)
                    .catch(handleLazyLoadError('stock-item')),
            },
            {
                path: 'report',
                component: StockItemReportComponent
            }
        ]
    },
    {
        path: 'stock-item/add',
        resolve: [stockSetupResolver],
        loadComponent: () => lazyLoadWithRetry(() => import('../pages/stock-item/stock-item-add/stock-item-add.component'))
            .then(r => r.StockItemAddComponent).catch(handleLazyLoadError('stock-item/add')),
    },
];
