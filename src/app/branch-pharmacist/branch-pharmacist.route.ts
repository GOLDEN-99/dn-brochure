import { Route } from '@angular/router';
import { handleLazyLoadError } from '../utils/lazy-load-error-handler';
import { OtherIncomeEmplGateComponent } from '../other-income/shared/components/other-income-empl-gate/other-income-empl-gate.component';
import { otherIncomeEmplAuthGuard } from '../other-income/shared/guards/other-income-empl-auth.guard';

/**
 * Opened from HUG Inhouse (เมนู ระบบ → ใบอนุญาต/เภสัชกรประจำสาขา) as
 * `/branch-pharmacist?emplCode=<emplCode>`, the same hand-over as Other Income v2: the guard resolves
 * the employee and the gate blocks the page when there is none. Every write records that employee.
 */
export const BRANCH_PHARMACIST_ROUTES: Route[] = [
  {
    path: 'branch-pharmacist',
    title: 'ใบอนุญาตและเภสัชกรประจำสาขา',
    component: OtherIncomeEmplGateComponent,
    canActivate: [otherIncomeEmplAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./branch-pharmacist-page.component')
          .then(r => r.BranchPharmacistPageComponent)
          .catch(handleLazyLoadError('branch-pharmacist')),
      },
    ],
  },
];
