import { Route } from '@angular/router';
import { CnLayoutComponent } from '../layout/cn-layout/cn-layout.component';
import { cnResolver } from '../resolvers/cn/cn.resolver';
import { CnComponent } from '../pages/cn-project/cn/cn.component';
import { cnGuard } from '../guard/cn-guard.guard';
import { CreateCancelRequestComponent } from '../cn/features/create-cancel-request/create-cancel-request.component';
import { CnStateService } from '../cn/shared/services/cn-state.service';

export const CN_ROUTES: Route[] = [
    {
        path: "cn/:saleCode/:wholeCode/:wholeNumb/:isWRR",
        component: CnLayoutComponent,
        resolve: { wholeItem: cnResolver },
        providers: [CnStateService],
        children: [
            {
                path: "",
                component: CnComponent
            },
            {
                path: "whole",
                loadComponent: () =>
                    import('../pages/cn-project/cn-all/cn-all.component')
                        .then(r => r.CnAllComponent),
                //canActivate: [cnGuard('whole')]
            },
            {
                path: "some",
                loadComponent: () =>
                    import('../pages/cn-project/cn-some/cn-some.component')
                        .then(r => r.CnSomeComponent),
                //canActivate: [cnGuard('some')]
            },
            {
                path: "some/detail",
                loadComponent: () =>
                    import('../pages/cn-project/cn-some-detail/cn-some-detail.component')
                        .then(r => r.CnSomeDetailComponent),
                canActivate: [cnGuard('some')]
            },
            {
                path: "upload",
                loadComponent: () =>
                    import('../pages/cn-project/cn-upload/cn-upload.component')
                        .then(r => r.CnUploadComponent),
                canActivate: [cnGuard(null)]
            },
            {
                path: "complete",
                loadComponent: () =>
                    import('../pages/cn-project/cn-complete/cn-complete.component')
                        .then(r => r.CnCompleteComponent)
            }
        ]
    },
];
