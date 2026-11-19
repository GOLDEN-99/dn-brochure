import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from '../service/api/api.service';
import { environment } from '../../environments/environment';
import { TBranchPharmacist, TBranchPharmacistPeriod, TPharmacistCandidate } from './branch-pharmacist.types';

/**
 * other-income-api `/branch-pharmacist`. Every write carries `emplCode` (the signed-in employee the
 * page was opened with) and returns the branch's row as it now stands.
 */
@Injectable({ providedIn: 'root' })
export class BranchPharmacistService {
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/branch-pharmacist`

  private candidates: TPharmacistCandidate[] | null = null

  list(): Observable<TBranchPharmacist[]> {
    return this.api.get<TBranchPharmacist[]>(this.url)
  }

  history(branchCode: string): Observable<TBranchPharmacistPeriod[]> {
    return this.api.get<TBranchPharmacistPeriod[]>(`${this.url}/history`, { params: { branchCode } })
  }

  /** Cached for the page's lifetime unless `refresh`: the list only changes with HR data. */
  getCandidates(refresh = false): Observable<TPharmacistCandidate[]> {
    if (this.candidates && !refresh) return of(this.candidates)
    return this.api.get<TPharmacistCandidate[]>(`${this.url}/candidates`).pipe(
      tap(rows => { this.candidates = rows }),
    )
  }

  setLicence(branchCode: string, licenceNo: string, emplCode: string): Observable<TBranchPharmacist> {
    return this.api.put<TBranchPharmacist>(`${this.url}/licence`, { branchCode, licenceNo, emplCode })
  }

  assign(branchCode: string, pharmacistCode: string, emplCode: string): Observable<TBranchPharmacist> {
    return this.api.post<TBranchPharmacist>(`${this.url}/assign`, { branchCode, pharmacistCode, emplCode })
  }

  end(branchCode: string, emplCode: string): Observable<TBranchPharmacist> {
    return this.api.post<TBranchPharmacist>(`${this.url}/end`, { branchCode, emplCode })
  }
}
