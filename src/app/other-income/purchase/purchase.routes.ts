import { Route } from '@angular/router';
import { OtherIncomeHomeLayoutComponent } from '../shared/components/layout/other-income-home-layout/other-income-home-layout.component';
import { OtherIncomeSearchCompService } from './services/other-income-search-comp.service';
import { OtherIncomeSearchProductService } from './services/other-income-search-product.service';
import { handleLazyLoadError } from '../../utils/lazy-load-error-handler';
import { OrderContractLayoutComponent } from '../shared/components/layout/order-contract-layout/order-contract-layout.component';
import { OrderContractContextService } from './services/order-contract-context.service';
import { SettlementContextService } from './services/settlement-context.service';
import { BranchContractLayoutComponent } from '../shared/components/layout/branch-contract-layout/branch-contract-layout.component';
import { BranchContractContextService } from './services/branch-contract-context.service';
import { PromoContractLayoutComponent } from '../shared/components/layout/promo-contract-layout/promo-contract-layout.component';
import { PromoContractContextService } from './services/promo-contract-context.service';
import { FOR_CONTRACT_DATA_TOKEN } from '../tokens/service-token';

export const PURCHASE_ROUTES: Route = {
    path: 'purchase',
    component: OtherIncomeHomeLayoutComponent,
    providers: [OtherIncomeSearchCompService, OtherIncomeSearchProductService],
    children: [
        {
            path: 'order',
            loadComponent: () => import('../purchase/components/pages/order-contract-list-page/order-contract-list-page.component')
                .then(c => c.OrderContractListPageComponent)
                .catch(handleLazyLoadError('purchase order-contracts'))
        },
        {
            path: 'order/create',
            loadComponent: () => import('../purchase/components/pages/order-contract-create-page/order-contract-create-page.component')
                .then(c => c.OrderContractCreatePageComponent)
                .catch(handleLazyLoadError('purchase order-contracts-create'))
        },
        {
            path: 'order/create-cross',
            loadComponent: () => import('../purchase/components/pages/order-contract-create-cross-page/order-contract-create-cross-page.component')
                .then(c => c.OrderContractCreateCrossPageComponent)
                .catch(handleLazyLoadError('purchase order-contracts-create-cross'))
        },
        {
            path: 'order/:id',
            component: OrderContractLayoutComponent,
            providers: [OrderContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'specs',
                    pathMatch: 'full'
                },
                {
                    path: 'specs',
                    loadComponent: () => import('../shared/components/pages/order-contract-specs-page/order-contract-specs-page.component')
                        .then(c => c.OrderContractSpecsPageComponent)
                        .catch(handleLazyLoadError('purchase order-contracts-specs'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/order-contract-accruals-page/order-contract-accruals-page.component')
                        .then(c => c.OrderContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('purchase order-contracts-accruals'))
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../purchase/components/pages/order-contract-settlements-page/order-contract-settlements-page.component')
                        .then(c => c.OrderContractSettlementsPageComponent)
                        .catch(handleLazyLoadError('purchase order-contracts-settlements'))
                },
                {
                    path: 'settlements/:settlementId',
                    providers: [
                        SettlementContextService,
                        {
                            provide: FOR_CONTRACT_DATA_TOKEN,
                            useExisting: OrderContractContextService
                        }
                    ],

                    loadComponent: () => import('../purchase/components/pages/settlement-detail-page/settlement-detail-page.component')
                        .then(c => c.SettlementDetailPageComponent)
                        .catch(handleLazyLoadError('settlement-detail'))
                },
            ]
        },

        {
            path: 'branch',
            loadComponent: () => import('../purchase/components/pages/branch-contract-list-page/branch-contract-list-page.component')
                .then(c => c.BranchContractListPageComponent)
                .catch(handleLazyLoadError('purchase branch-contracts'))
        },
        {
            path: 'branch/create',
            loadComponent: () => import('../purchase/components/pages/branch-contract-create-page/branch-contract-create-page.component')
                .then(c => c.BranchContractCreatePageComponent)
                .catch(handleLazyLoadError('purchase branch-contracts-create'))
        },
        {
            path: 'branch/:id',
            component: BranchContractLayoutComponent,
            providers: [BranchContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'specs',
                    pathMatch: 'full'
                },
                {
                    path: 'specs',
                    loadComponent: () => import('../shared/components/pages/branch-contract-specs-page/branch-contract-specs-page.component')
                        .then(c => c.BranchContractSpecsPageComponent)
                        .catch(handleLazyLoadError('purchase branch-contracts-specs'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/branch-contract-accruals-page/branch-contract-accruals-page.component')
                        .then(c => c.BranchContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('purchase branch-contracts-accruals'))
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../purchase/components/pages/branch-contract-settlements-page/branch-contract-settlements-page.component')
                        .then(c => c.BranchContractSettlementsPageComponent)
                        .catch(handleLazyLoadError('purchase branch-contracts-settlements'))
                },
                {
                    path: 'settlements/:settlementId',
                    providers: [
                        SettlementContextService,
                        {
                            provide: FOR_CONTRACT_DATA_TOKEN,
                            useExisting: BranchContractContextService
                        }
                    ],
                    loadComponent: () => import('../purchase/components/pages/settlement-detail-page/settlement-detail-page.component')
                        .then(c => c.SettlementDetailPageComponent)
                        .catch(handleLazyLoadError('settlement-detail'))
                },
            ]
        },
        {
            path: 'promo',
            loadComponent: () => import('../purchase/components/pages/promo-contract-list-page/promo-contract-list-page.component')
                .then(c => c.PromoContractListPageComponent)
                .catch(handleLazyLoadError('purchase promo-contracts'))
        },
        {
            path: 'promo/create',
            loadComponent: () => import('../purchase/components/pages/promo-contract-create-page/promo-contract-create-page.component')
                .then(c => c.PromoContractCreatePageComponent)
                .catch(handleLazyLoadError('purchase promo-contracts-create'))
        },
        {
            path: 'promo/:id',
            component: PromoContractLayoutComponent,
            providers: [PromoContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'specs',
                    pathMatch: 'full'
                },
                {
                    path: 'specs',
                    loadComponent: () => import('../shared/components/pages/promo-contract-specs-page/promo-contract-specs-page.component')
                        .then(c => c.PromoContractSpecsPageComponent)
                        .catch(handleLazyLoadError('purchase promo-contracts-specs'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/promo-contract-accruals-page/promo-contract-accruals-page.component')
                        .then(c => c.PromoContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('purchase promo-contracts-accruals'))
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../purchase/components/pages/promo-contract-settlements-page/promo-contract-settlements-page.component')
                        .then(c => c.PromoContractSettlementsPageComponent)
                        .catch(handleLazyLoadError('purchase promo-contracts-settlements'))
                },
                {
                    path: 'settlements/:settlementId',
                    providers: [
                        SettlementContextService,
                        {
                            provide: FOR_CONTRACT_DATA_TOKEN,
                            useExisting: PromoContractContextService
                        }
                    ],
                    loadComponent: () => import('../purchase/components/pages/settlement-detail-page/settlement-detail-page.component')
                        .then(c => c.SettlementDetailPageComponent)
                        .catch(handleLazyLoadError('settlement-detail'))
                },
            ]
        },
        {
            path: '',
            redirectTo: 'order',
            pathMatch: 'full'
        },
    ]
} as const