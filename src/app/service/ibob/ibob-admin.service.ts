import { inject, Injectable, signal } from '@angular/core';
import { DateRangeService } from './date-range-service.service';
import { IbobQueryReservationService, TQueryReservation } from './ibob-query-reservation.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Subject, switchMap } from 'rxjs';
import { debounceSearch } from '../../lib/utli';

@Injectable({
  providedIn: 'root'
})
export class IbobAdminService {

  constructor() { }

  private dateRangeService = inject(DateRangeService)
  private retry = signal(0)
  private retry$ = toObservable(this.retry)
  refetch = () => this.retry.update(prev => prev + 1)
  fromDate = this.dateRangeService.fromDate
  toDate = this.dateRangeService.toDate
  getDateRange = this.dateRangeService.getDateRange

  compName = signal("")
  order = signal("")
  compCode = signal("")

  private queryReservationService = inject(IbobQueryReservationService)


  private param$ = new Subject<TQueryReservation>()
  private reservationList$ = combineLatest([this.param$, this.retry$])
    .pipe(
      switchMap(([q, cnt]) => this.queryReservationService.getManyReservation(q))
    )

  reservationList = toSignal(this.reservationList$, { initialValue: [] })
  searchReservation = (q: TQueryReservation) => {
    this.param$.next(q)
  }

  deleteReservation = this.queryReservationService.deleteReservation
}
