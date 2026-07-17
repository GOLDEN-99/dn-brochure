import { CanActivateFn, Route, Router } from '@angular/router';
import { CnLayoutComponent } from '../shared/components/cn-layout/cn-layout.component';
import { CnStateService } from '../shared/services/cn-state.service';
import { CreateCancelRequestComponent } from '../features/create-cancel-request/create-cancel-request.component';
import { handleLazyLoadError, lazyLoadWithRetry } from '../../utils/lazy-load-error-handler';
import { inject } from '@angular/core';
import { TCnType } from '../shared/types/cn.type';


export const cnGuard = (expectedCnType: TCnType | 'upload'): CanActivateFn => (route, state) => {
    const stateService = inject(CnStateService);
    if (stateService.endPoint() === expectedCnType) return true;
    const router = inject(Router);
    const parentPath = route.parent?.url.map(s => s.path).join('/');
    return router.createUrlTree(parentPath ? [parentPath] : ['/']);
}

export const CN_ROUTES: Route[] = [
    {
        path: "cn/:saleCode/:wholeCode/:wholeNumb/:isWRR",
        component: CnLayoutComponent,
        providers: [CnStateService],
        children: [
            {
                path: "",
                component: CreateCancelRequestComponent
            },
            {
                path: "whole",
                loadComponent: () => lazyLoadWithRetry(() => import('../features/whole-cancel-order/whole-cancel-order.component'))
                        .then(r => r.WholeCancelOrderComponent),
                canActivate: [cnGuard('whole')]
            },
            {
                path: "some",
                loadComponent: () => lazyLoadWithRetry(() => import('../features/partial-cancel-product-picker/partial-cancel-product-picker.component'))
                        .then(r => r.PartialCancelProductPickerComponent)
                        .catch(handleLazyLoadError('cn/partial-request-picker')),
                canActivate: [cnGuard('some')]
            },
            {
                path: "some/detail",
                loadComponent: () => lazyLoadWithRetry(() => import('../features/partial-cancel-order/partial-cancel-order.component'))
                        .then(r => r.PartialCancelOrderComponent)
                        .catch(handleLazyLoadError('cn/partial-request')),
                canActivate: [cnGuard('some')]
            },
            {
                path: "upload",
                loadComponent: () => lazyLoadWithRetry(() => import('../features/cn-upload/cn-upload.component'))
                        .then(r => r.CnUploadComponent).catch(handleLazyLoadError('cn/uplaod')),
                canActivate: [cnGuard('upload')]
            },
            {
                path: "complete",
                loadComponent: () => lazyLoadWithRetry(() => import('../features/cn-complete/cn-complete.component'))
                        .then(r => r.CnCompleteComponent).catch(handleLazyLoadError('cn/complete'))
            },
            {
                path: 'fail',
                loadComponent: () => lazyLoadWithRetry(() => import('../features/cn-fail/cn-fail.component'))
                    .then(c => c.CnFailComponent)
                    .catch(handleLazyLoadError('cn/complete'))
            }
        ]
    },
];