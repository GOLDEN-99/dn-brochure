import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map, of } from 'rxjs';
import { OtherIncomeEmplAuthService } from '../services/other-income-empl-auth.service';

/**
 * Always resolves `true` — it never blocks navigation. It only resolves the
 * emplCode (query param, falling back to localStorage) and loads the employee
 * into the shared OtherIncomeEmplAuthService state. OtherIncomeEmplGateComponent
 * reads that state to decide whether to render children or a blocked-state
 * placeholder.
 */
export const otherIncomeEmplAuthGuard: CanActivateFn = (route) => {
  const auth = inject(OtherIncomeEmplAuthService)

  const queryEmplCode = route.queryParamMap.get('emplCode')
  const emplCode = auth.resolveEmplCode(queryEmplCode)

  if (!emplCode) {
    auth.checked.set(true)
    return of(true)
  }

  return auth.loadEmployee(emplCode).pipe(map(() => true))
};
