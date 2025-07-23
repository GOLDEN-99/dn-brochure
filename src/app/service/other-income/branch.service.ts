import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  constructor() { }
  private api = inject(ApiService)
  private url = environment.oi
  term = signal("")
  private term$ = toObservable(this.term)
  private searchBranch(term: string): Observable<TBranchDto[]> {
    if (term === '') return of([])
    return this.api.get<TBranchDto[]>(`${this.url}/other-income/branch`, { params: { term } }).pipe(catchError(err => of([])))
  }
  private queryBranch$ = this.term$.pipe(switchMap(t => this.searchBranch(t)))
  queryBranch = toSignal(this.queryBranch$, { initialValue: [] })
}

type TBranchDto = {
  branchCode: string
  branchName: string
}
