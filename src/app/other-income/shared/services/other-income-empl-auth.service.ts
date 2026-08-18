import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { TEmployee } from '../types/other-income.type';

const STORAGE_KEY = 'other-income-empl-code'
const TTL_MS = 4 * 60 * 60 * 1000

type TStoredEmplCode = {
  emplCode: string
  expire: number
}

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeEmplAuthService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  readonly employee = signal<TEmployee | null>(null)
  readonly checked = signal(false)

  /** Resolves emplCode from the query param, falling back to a non-expired localStorage entry. */
  resolveEmplCode(queryEmplCode: string | null): string | null {
    if (queryEmplCode) return queryEmplCode
    return this.readStoredEmplCode()
  }

  /** Fetches and caches the employee; on success persists emplCode to localStorage with a fresh 4h expiry. */
  loadEmployee(emplCode: string): Observable<TEmployee | null> {
    const current = this.employee()
    if (this.checked() && current?.emplCode === emplCode) return of(current)

    return this.api.get<TEmployee>(`${this.url}/v2/master/employees/${emplCode}`).pipe(
      tap(employee => {
        this.employee.set(employee)
        this.storeEmplCode(employee.emplCode)
        this.checked.set(true)
      }),
      catchError(() => {
        this.employee.set(null)
        this.clearStoredEmplCode()
        this.checked.set(true)
        return of(null)
      }),
    )
  }

  private readStoredEmplCode(): string | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const stored = JSON.parse(raw) as TStoredEmplCode
      if (!stored.emplCode || !stored.expire || stored.expire < Date.now()) {
        this.clearStoredEmplCode()
        return null
      }
      return stored.emplCode
    } catch {
      this.clearStoredEmplCode()
      return null
    }
  }

  private storeEmplCode(emplCode: string): void {
    const stored: TStoredEmplCode = { emplCode, expire: Date.now() + TTL_MS }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }

  private clearStoredEmplCode(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
