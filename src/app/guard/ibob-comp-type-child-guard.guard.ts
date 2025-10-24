import { inject } from '@angular/core';
import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';

export const ibobCompTypeChildGuardGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router)
  const compType = childRoute.parent?.paramMap.get('compType')
  if (typeof compType !== 'string') return new RedirectCommand(router.parseUrl("notfound"))
  const normalizeComp = compType.toUpperCase()
  return normalizeComp === 'DN' || normalizeComp === 'HU';
};
