import { Route } from '@angular/router';
import { SupplierReserveLayoutComponent } from '../layout/supplier-reserve-layout/supplier-reserve-layout.component';
import { SupplierReserveComponent } from '../pages/supplier-project/supplier-reserve/supplier-reserve.component';
import { InOutLayoutComponent } from '../layout/in-out-layout/in-out-layout.component';
import { InOutViewComponent } from '../pages/supplier-project/in-out-view/in-out-view.component';
import { InOutEditComponent } from '../pages/supplier-project/in-out-edit/in-out-edit.component';
import { InOutListComponent } from '../pages/supplier-project/in-out-list/in-out-list.component';
import { getByWarehouseResolver } from '../resolvers/ibob/get-by-warehouse.resolver';
import { InOutNavComponent } from '../layout/in-out-nav/in-out-nav.component';
import { InOutAddComponent } from '../pages/supplier-project/in-out-add/in-out-add.component';
import { InOutDetailComponent } from '../pages/supplier-project/in-out-detail/in-out-detail.component';
import { fetchDoorDetailResolver } from '../resolvers/ibob/fetch-door-detail.resolver';
import { InOutQueryComponent } from '../pages/supplier-project/in-out-query/in-out-query.component';
import { ibobCompTypeChildGuardGuard } from '../guard/ibob-comp-type-child-guard.guard';
import { ibobAuthGuard } from '../guard/ibob-auth.guard';
import { handleLazyLoadError } from '../utils/lazy-load-error-handler';

export const SUPPLIER_ROUTES: Route[] = [
    {
        path: 'supplier/reserve/:compType',
        title: (route, _) => `SUPPLIER RESERVATION ${route.paramMap.get('compType')?.toUpperCase() ?? ''}`,
        canActivateChild: [ibobCompTypeChildGuardGuard, ibobAuthGuard],
        component: SupplierReserveLayoutComponent,
        children: [
            {
                path: "",
                component: SupplierReserveComponent
            },
            {
                path: "add/:warehouse",
                resolve: [getByWarehouseResolver],
                loadComponent: () => import('../pages/supplier-project/supplier-reserve-add/supplier-reserve-add.component')
                    .then(r => r.SupplierReserveAddComponent)
            },
            {
                path: 'login',
                loadComponent: () => import('../pages/supplier-project/supplier-login/supplier-login.component')
                    .then(r => r.SupplierLoginComponent)
            }
        ]
    },
    {
        path: 'supplier/in-out',
        component: InOutNavComponent,
        title: 'INBOUND OUTBOUND',
        children: [
            {
                path: ':warehouse',
                resolve: [getByWarehouseResolver],
                component: InOutLayoutComponent,
                children: [
                    {
                        path: '',
                        component: InOutViewComponent
                    },
                    {
                        path: 'list',
                        component: InOutListComponent
                    },
                    {
                        path: 'list/add',
                        component: InOutAddComponent
                    },
                    {
                        path: 'list/:doorId',
                        resolve: [fetchDoorDetailResolver],
                        children: [
                            {
                                path: '',
                                component: InOutDetailComponent
                            },
                            {
                                path: 'edit',
                                component: InOutEditComponent
                            }
                        ]
                    },
                    {
                        path: 'query',
                        component: InOutQueryComponent
                    },
                    {
                        path: 'add',
                        loadComponent: () => import("../pages/supplier-project/ibob-admin-add/ibob-admin-add.component")
                            .then(r => r.IbobAdminAddComponent)
                            .catch(handleLazyLoadError('supplier/in-out/add')),
                    },
                    {
                        path: ':reserveId',
                        loadComponent: () => import("../pages/supplier-project/ibob-admin-edit/ibob-admin-edit.component")
                            .then(r => r.IbobAdminEditComponent)
                            .catch(handleLazyLoadError('supplier/in-out/:reserveId')),
                    }
                ]
            }
        ]
    },
];
