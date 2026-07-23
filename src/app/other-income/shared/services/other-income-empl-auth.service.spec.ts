import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OtherIncomeEmplAuthService } from './other-income-empl-auth.service';
import { ApiService } from '../../../shared/services/api.service';

const STORAGE_KEY = 'other-income-empl-code'

describe('OtherIncomeEmplAuthService', () => {
  let service: OtherIncomeEmplAuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    apiSpy = jasmine.createSpyObj('ApiService', ['get'])

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(OtherIncomeEmplAuthService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resolveEmplCode', () => {
    it('prefers the query param over localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ emplCode: 'STORED', expire: Date.now() + 1000 }))
      expect(service.resolveEmplCode('QUERY')).toBe('QUERY')
    })

    it('falls back to a non-expired stored emplCode when query param is null', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ emplCode: 'STORED', expire: Date.now() + 1000 }))
      expect(service.resolveEmplCode(null)).toBe('STORED')
    })

    it('returns null when stored entry is expired', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ emplCode: 'STORED', expire: Date.now() - 1000 }))
      expect(service.resolveEmplCode(null)).toBeNull()
    })

    it('returns null when nothing is stored and no query param', () => {
      expect(service.resolveEmplCode(null)).toBeNull()
    })

    it('returns null and clears storage on malformed JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json')
      expect(service.resolveEmplCode(null)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('loadEmployee', () => {
    it('sets employee and persists emplCode with a ~4h expiry on success', () => {
      apiSpy.get.and.returnValue(of({ emplCode: 'E1', emplName: 'Somchai' }))

      service.loadEmployee('E1').subscribe()

      expect(service.employee()).toEqual({ emplCode: 'E1', emplName: 'Somchai' })
      expect(service.checked()).toBeTrue()

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.emplCode).toBe('E1')
      expect(stored.expire).toBeGreaterThan(Date.now() + 3.9 * 60 * 60 * 1000)
      expect(stored.expire).toBeLessThanOrEqual(Date.now() + 4 * 60 * 60 * 1000)
    })

    it('clears employee and storage on API failure', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ emplCode: 'E1', expire: Date.now() + 1000 }))
      apiSpy.get.and.returnValue(throwError(() => new Error('not found')))

      service.loadEmployee('E1').subscribe()

      expect(service.employee()).toBeNull()
      expect(service.checked()).toBeTrue()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('does not re-call the API when already checked for the same emplCode', () => {
      apiSpy.get.and.returnValue(of({ emplCode: 'E1', emplName: 'Somchai' }))
      service.loadEmployee('E1').subscribe()
      expect(apiSpy.get).toHaveBeenCalledTimes(1)

      service.loadEmployee('E1').subscribe()
      expect(apiSpy.get).toHaveBeenCalledTimes(1)
    })

    it('re-calls the API when emplCode differs from the cached employee', () => {
      apiSpy.get.and.returnValue(of({ emplCode: 'E1', emplName: 'Somchai' }))
      service.loadEmployee('E1').subscribe()

      apiSpy.get.and.returnValue(of({ emplCode: 'E2', emplName: 'Somsri' }))
      service.loadEmployee('E2').subscribe()

      expect(apiSpy.get).toHaveBeenCalledTimes(2)
      expect(service.employee()).toEqual({ emplCode: 'E2', emplName: 'Somsri' })
    })
  })
});
