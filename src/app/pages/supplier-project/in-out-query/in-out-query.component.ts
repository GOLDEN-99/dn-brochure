import { Component, computed, inject, signal } from '@angular/core';
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, filter, map, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IbobAdminService } from '../../../service/ibob/ibob-admin.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { getOrElse } from '../../../lib/utli';


@Component({
  selector: 'app-in-out-query',
  imports: [FormsModule, DateInputComponent, RouterLink, DatePipe],
  templateUrl: './in-out-query.component.html',
  styleUrl: './in-out-query.component.scss',
})
export class InOutQueryComponent {
  private ibobAdminService = inject(IbobAdminService)
  fromDate = this.ibobAdminService.fromDate
  toDate = this.ibobAdminService.toDate
  compName = this.ibobAdminService.compName
  order = this.ibobAdminService.order
  reserveList = this.ibobAdminService.reservationList
  onSearch = this.ibobAdminService.searchReservation

  private route = inject(ActivatedRoute)
  private warehouse$ = this.route.parent?.paramMap.pipe(
    map(pm => pm.get("warehouse")),
    tap(console.log),
    map(Number),
    filter(wh => !isNaN(wh)),
  ) ?? of(0)
  warehouseId = toSignal(this.warehouse$, { initialValue: 0 })
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

  private isAdmin$ = this.route.queryParamMap
    .pipe(
      map(q => q.get("adminCode") === '123456'),
      getOrElse(false)
    )
  isAdmin = toSignal(this.isAdmin$, { initialValue: false })
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday()
  from = signal(this.today)
  to = signal(this.today)
  private router = inject(Router)
  createLink = computed(() => this.router.createUrlTree(
    ['supplier', 'in-out', this.warehouseId(), 'add'],
  ))
  optionList = [{ id: "compName", label: "ชื่อซัพ" }, { id: "order", label: "เลข order" }]
  currentOption = signal('')
  onCurrentOptionChange(opt: string) {
    this.currentOption.set(opt)
    if (opt === 'compName') {
      this.order.set("")
      return
    }
    if (opt === 'order') {
      this.compName.set("")
    }
  }

  onClick() {
    const warehouse = this.warehouseId()
    const compName = this.compName()
    const order = this.order()
    const dateRange = this.ibobAdminService.getDateRange()
    this.onSearch({ warehouse, compName, order, ...dateRange })
  }

  onDelete(reservationId: number) {
    this.ibobAdminService.deleteReservation(reservationId).subscribe({
      next: (res) => {
        this.ibobAdminService.refetch()
      }
    })
  }

}
