import { Route } from '@angular/router';
import { OtherIncomeAccountHomeLayoutComponent } from '../shared/components/layout/other-income-account-home-layout/other-income-account-home-layout.component';
import { handleLazyLoadError } from '../../utils/lazy-load-error-handler';
import { AccountOrderContractLayoutComponent } from '../shared/components/layout/account-order-contract-layout/account-order-contract-layout.component';
import { OrderContractContextService } from '../purchase/services/order-contract-context.service';
import { SettlementContextService } from '../purchase/services/settlement-context.service';
import { AccountBranchContractLayoutComponent } from '../shared/components/layout/account-branch-contract-layout/account-branch-contract-layout.component';
import { BranchContractContextService } from '../purchase/services/branch-contract-context.service';
import { AccountPromoContractLayoutComponent } from '../shared/components/layout/account-promo-contract-layout/account-promo-contract-layout.component';
import { PromoContractContextService } from '../purchase/services/promo-contract-context.service';
import { FOR_CONTRACT_DATA_TOKEN } from '../tokens/service-token';
export const ACCOUNT_ROUTES: Route = {
    path: 'account',
    component: OtherIncomeAccountHomeLayoutComponent,
    children: [
        {
            path: '',
            loadComponent: () => import('../account/pages/settlement-worklist-page/settlement-worklist-page.component')
                .then(c => c.SettlementWorklistPageComponent)
                .catch(handleLazyLoadError('account settlements-worklist'))
        },
        {
            path: 'invoice-states',
            loadComponent: () => import('../account/pages/invoice-state-worklist-page/invoice-state-worklist-page.component')
                .then(c => c.InvoiceStateWorklistPageComponent)
                .catch(handleLazyLoadError('account invoice-states'))
        },
        {
            path: 'bill-discount-states',
            loadComponent: () => import('../account/pages/bill-discount-state-worklist-page/bill-discount-state-worklist-page.component')
                .then(c => c.BillDiscountStateWorklistPageComponent)
                .catch(handleLazyLoadError('account bill-discount-states'))
        },
        {
            path: 'free-item-states',
            loadComponent: () => import('../account/pages/free-item-state-worklist-page/free-item-state-worklist-page.component')
                .then(c => c.FreeItemStateWorklistPageComponent)
                .catch(handleLazyLoadError('account free-item-states'))
        },
        {
            path: 'report/settlement',
            loadComponent: () => import('../account/pages/settlement-report-page/settlement-report-page.component')
                .then(c => c.SettlementReportPageComponent)
                .catch(handleLazyLoadError('account settlement-report'))
        },
        {
            path: 'report/order',
            loadComponent: () => import('../account/pages/accrual-order-report-page/accrual-order-report-page.component')
                .then(c => c.AccrualOrderReportPageComponent)
                .catch(handleLazyLoadError('account accrual-order-report'))
        },
        {
            path: 'report/branch',
            loadComponent: () => import('../account/pages/accrual-branch-report-page/accrual-branch-report-page.component')
                .then(c => c.AccrualBranchReportPageComponent)
                .catch(handleLazyLoadError('account accrual-branch-report'))
        },
        {
            path: 'report/promo',
            loadComponent: () => import('../account/pages/accrual-promo-report-page/accrual-promo-report-page.component')
                .then(c => c.AccrualPromoReportPageComponent)
                .catch(handleLazyLoadError('account accrual-promo-report'))
        },
        {
            path: 'report/contributing-products',
            loadComponent: () => import('../account/pages/contributing-products-report-page/contributing-products-report-page.component')
                .then(c => c.ContributingProductsReportPageComponent)
                .catch(handleLazyLoadError('account contributing-products-report'))
        },
        {
            path: 'order/:id',
            component: AccountOrderContractLayoutComponent,
            providers: [OrderContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'spec',
                    pathMatch: 'full'
                },
                {
                    path: 'spec',
                    loadComponent: () => import('../shared/components/pages/order-contract-specs-page/order-contract-specs-page.component')
                        .then(c => c.OrderContractSpecsPageComponent)
                        .catch(handleLazyLoadError('account order-spec'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/order-contract-accruals-page/order-contract-accruals-page.component')
                        .then(c => c.OrderContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('account order-contracts-accruals')),
                    data: { isAccount: true }
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../account/pages/order-settlements-page/order-settlements-page.component')
                        .then(c => c.OrderSettlementsPageComponent)
                        .catch(handleLazyLoadError('account order-settlements'))
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
                        .catch(handleLazyLoadError('settlement-detail')),
                    data: { isAccount: true }
                },
            ]
        },
        {
            path: 'branch/:id',
            component: AccountBranchContractLayoutComponent,
            providers: [BranchContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'spec',
                    pathMatch: 'full'
                },
                {
                    path: 'spec',
                    loadComponent: () => import('../shared/components/pages/branch-contract-specs-page/branch-contract-specs-page.component')
                        .then(c => c.BranchContractSpecsPageComponent)
                        .catch(handleLazyLoadError('account branch-spec'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/branch-contract-accruals-page/branch-contract-accruals-page.component')
                        .then(c => c.BranchContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('account branch-contracts-accruals')),
                    data: { isAccount: true }
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../account/pages/branch-settlements-page/branch-settlements-page.component')
                        .then(c => c.BranchSettlementsPageComponent)
                        .catch(handleLazyLoadError('account branch-settlements'))
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
                        .catch(handleLazyLoadError('settlement-detail')),
                    data: { isAccount: true }
                },
            ]
        },
        {
            path: 'promo/:id',
            component: AccountPromoContractLayoutComponent,
            providers: [PromoContractContextService],
            children: [
                {
                    path: '',
                    redirectTo: 'spec',
                    pathMatch: 'full'
                },
                {
                    path: 'spec',
                    loadComponent: () => import('../shared/components/pages/promo-contract-specs-page/promo-contract-specs-page.component')
                        .then(c => c.PromoContractSpecsPageComponent)
                        .catch(handleLazyLoadError('account promo-spec'))
                },
                {
                    path: 'accruals',
                    loadComponent: () => import('../purchase/components/pages/promo-contract-accruals-page/promo-contract-accruals-page.component')
                        .then(c => c.PromoContractAccrualsPageComponent)
                        .catch(handleLazyLoadError('account promo-contracts-accruals')),
                    data: { isAccount: true }
                },
                {
                    path: 'settlements',
                    loadComponent: () => import('../account/pages/promo-settlements-page/promo-settlements-page.component')
                        .then(c => c.PromoSettlementsPageComponent)
                        .catch(handleLazyLoadError('account promo-settlements'))
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
                        .catch(handleLazyLoadError('settlement-detail')),
                    data: { isAccount: true }
                },
            ]
        },
    ]
} as const