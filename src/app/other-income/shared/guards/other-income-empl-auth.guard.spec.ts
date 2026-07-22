import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, convertToParamMap, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { otherIncomeEmplAuthGuard } from './other-income-empl-auth.guard';
import { OtherIncomeEmplAuthService } from '../services/other-income-empl-auth.service';

describe('otherIncomeEmplAuthGuard', () => {
  let resolveEmplCodeSpy: jasmine.Spy;
  let loadEmployeeSpy: jasmine.Spy;
  let checkedSetSpy: jasmine.Spy;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => otherIncomeEmplAuthGuard(...guardParameters));

  const routeWithQuery = (emplCode: string | null) => ({
    queryParamMap: convertToParamMap(emplCode ? { emplCode } : {}),
  } as unknown as ActivatedRouteSnapshot);

  beforeEach(() => {
    resolveEmplCodeSpy = jasmine.createSpy('resolveEmplCode')
    loadEmployeeSpy = jasmine.createSpy('loadEmployee')
    checkedSetSpy = jasmine.createSpy('set')

    const authMock = {
      resolveEmplCode: resolveEmplCodeSpy,
      loadEmployee: loadEmployeeSpy,
      checked: { set: checkedSetSpy },
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OtherIncomeEmplAuthService, useValue: authMock }],
    });
  });

  it('always resolves true when no emplCode is found', async () => {
    resolveEmplCodeSpy.and.returnValue(null)
    const result = executeGuard(routeWithQuery(null), {} as RouterStateSnapshot) as any
    expect(await firstValueFrom(result)).toBeTrue()
  });

  it('always resolves true when the employee loads successfully', async () => {
    resolveEmplCodeSpy.and.returnValue('E1')
    loadEmployeeSpy.and.returnValue(of({ emplCode: 'E1', emplName: 'Somchai' }))

    const result = executeGuard(routeWithQuery('E1'), {} as RouterStateSnapshot) as any
    expect(await firstValueFrom(result)).toBeTrue()
  });

  it('marks checked and skips loadEmployee when no emplCode can be resolved', () => {
    resolveEmplCodeSpy.and.returnValue(null)

    executeGuard(routeWithQuery(null), {} as RouterStateSnapshot)

    expect(checkedSetSpy).toHaveBeenCalledWith(true)
    expect(loadEmployeeSpy).not.toHaveBeenCalled()
  });

  it('reads emplCode from the query param and loads the employee', () => {
    resolveEmplCodeSpy.and.returnValue('E1')
    loadEmployeeSpy.and.returnValue(of({ emplCode: 'E1', emplName: 'Somchai' }))

    executeGuard(routeWithQuery('E1'), {} as RouterStateSnapshot)

    expect(resolveEmplCodeSpy).toHaveBeenCalledWith('E1')
    expect(loadEmployeeSpy).toHaveBeenCalledWith('E1')
  });

  it('falls back through resolveEmplCode when query param is absent', () => {
    resolveEmplCodeSpy.and.returnValue('STORED')
    loadEmployeeSpy.and.returnValue(of({ emplCode: 'STORED', emplName: 'Somsri' }))

    executeGuard(routeWithQuery(null), {} as RouterStateSnapshot)

    expect(resolveEmplCodeSpy).toHaveBeenCalledWith(null)
    expect(loadEmployeeSpy).toHaveBeenCalledWith('STORED')
  });
});
