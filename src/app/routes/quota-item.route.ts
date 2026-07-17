import { Route } from '@angular/router';
import { PurchaseLayoutComponent, QUOTA_ITEM_TOKEN, TAB_TOKEN } from '../layout/other-income/purchase-layout/purchase-layout.component';
import { handleLazyLoadError, lazyLoadWithRetry } from '../utils/lazy-load-error-handler';

export const QUOTA_ITEM_ROUTES: Route[] = [
    {
        path: 'quota-item',
        component: PurchaseLayoutComponent,
        providers: [
            {
                provide: TAB_TOKEN,
                useValue: QUOTA_ITEM_TOKEN
            }
        ],
        children: [
            {
                path: '',
                loadComponent: () => lazyLoadWithRetry(() => import('../pages/quota-item/quota-item-add/quota-item-add.component'))
                    .then(r => r.QuotaItemAddComponent)
                    .catch(handleLazyLoadError('quota-item'))
            },
            {
                path: 'good-list',
                loadComponent: () => lazyLoadWithRetry(() => import('../pages/quota-item/quota-item-list/quota-item-list.component'))
                    .then(r => r.QuotaItemListComponent).catch(handleLazyLoadError('quota-item/good-list'))
            },
            {
                path: 'whole-list',
                loadComponent: () => lazyLoadWithRetry(() => import('../pages/quota-item/quota-item-whole-list/quota-item-whole-list.component'))
                    .then(r => r.QuotaItemWholeListComponent)
                    .catch(handleLazyLoadError('quota-item/whole-list'))
            }
        ]
    },
];
