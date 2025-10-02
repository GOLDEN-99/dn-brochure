import { computed, effect, inject, Injectable, InjectionToken, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, map, Observable } from 'rxjs';
import { convertToIso } from '../../lib';

export interface IDateRange {
  fromDate: Signal<NgbDate>
  toDate: Signal<NgbDate>
  dateRange$: Observable<{ fromDate: string, toDate: string }>
}
export const DATE_RANGE_TOKEN = new InjectionToken<IDateRange>('date_range_token')
@Injectable({
  providedIn: 'root'
})
export class DateRangeService implements IDateRange {

  constructor() {
    const eff = effect(() => { console.log(this.formatFromDate()); console.log(this.formatToDate()) })
  }

  private cal = inject(NgbCalendar)
  private today = this.cal.getToday()

  fromDate = signal(this.today)
  toDate = signal(this.today)
  formatFromDate = computed(() => convertToIso(this.fromDate()))
  formatToDate = computed(() => convertToIso(this.cal.getNext(this.toDate(), 'd', 1)))
  getDateRange = () => {
    const fromDate = this.formatFromDate()
    const toDate = this.formatToDate()
    return { fromDate, toDate }
  }
  private fromDate$ = toObservable(this.formatFromDate)
  private toDate$ = toObservable(this.formatToDate)
  dateRange$ = combineLatest([this.fromDate$, this.toDate$])
    .pipe(
      map(([fromDate, toDate]) => ({ fromDate, toDate }))
    )

}
