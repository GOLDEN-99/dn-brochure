import { Component, computed, inject, input, signal } from '@angular/core';
import { IbobQueryTabComponent } from "../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component";
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_FIELD_SEARCH_TOKEN, IBOB_RESERVATION_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, combineLatestAll, map, tap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getOrElse } from '../../../lib/utli';

@Component({
  selector: 'app-in-out-query',
  imports: [IbobQueryTabComponent, DateInputComponent, RouterLink],
  templateUrl: './in-out-query.component.html',
  styleUrl: './in-out-query.component.scss',
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: IBOB_RESERVATION_SEARCH
    }
  ]
})
export class InOutQueryComponent {
  private route = inject(ActivatedRoute)
  private url$ = combineLatest(
    this.route.pathFromRoot.map(snapshot => snapshot.url)
  ).pipe(
    map(arr => arr.flatMap(a => a.map(seg => seg.path)))
  )
  // ['', supplier, in-out, 1 ,query]
  url = toSignal(this.url$, { initialValue: [] })
  queryString = computed(() => {
    const arr = this.url()
    return `${arr[2]}/${arr[3]}/${arr[4]}`
  })
  warehouseId = computed(() => this.url()[3])
  isAdmin = signal(true)
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday()
  from = signal(this.today)
  to = signal(this.today)
  private router = inject(Router)
  createLink = computed(() => this.router.createUrlTree(
    ['supplier', 'reserve', 'add', this.warehouseId()],
    { queryParams: { from: this.queryString() } }
  ))
}
