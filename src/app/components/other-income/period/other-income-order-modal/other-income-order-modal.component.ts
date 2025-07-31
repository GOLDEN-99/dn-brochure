import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { TPeriodResult } from '../../../../service/other-income/base-oi';
import { OrderService, TAppOIOrder, TOiOrder } from '../../../../service/other-income/order.service';
import { PeriodService } from '../../../../service/other-income/period.service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-other-income-order-modal',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './other-income-order-modal.component.html',
  styleUrl: './other-income-order-modal.component.scss'
})
export class OtherIncomeOrderModalComponent implements OnInit, OnDestroy {
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  periodId = input.required<number>()

  private predicateEmpty = (value: unknown): value is string => {
    return typeof value === 'string' && value !== ''
  }
  private compType$ = toObservable(this.compType).pipe(filter(this.predicateEmpty))
  private compCode$ = toObservable(this.compCode).pipe(filter(this.predicateEmpty))
  private compCriteria$ = combineLatest([this.compType$, this.compCode$])
  private unsub$ = new Subject<void>()

  ngOnInit(): void {
    this.compCriteria$.pipe(takeUntil(this.unsub$)).subscribe(([type, code]) => this.poService.setComp(code, type))
  }
  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  success = output<string>()
  fail = output<string>()
  close = output<void>()

  private poService = inject(OrderService)
  private periodService = inject(PeriodService)
  term = this.poService.term
  orderList = this.poService.queryOrder
  selectOrder = signal<TAppOIOrder[]>([])
  sum = computed(() => this.selectOrder().reduce((acc, { actualAmount }) => acc + actualAmount, 0))
  periodAmount = input.required<number>()
  private orderSet = new Set()
  addOrder = (order: TOiOrder) => {
    const hasValue = this.orderSet.has(order.orderNumb)
    if (hasValue) {
      this.fail.emit("po ซ้ำ");
      return
    }
    this.orderSet.add(order.orderNumb)
    this.selectOrder.update(prev => [...prev, { ...order, actualAmount: 0 }])
  }
  deleteOrder(orderNumb: string) {
    this.orderSet.delete(orderNumb);
    this.selectOrder.update(prev => prev.filter(p => p.orderNumb !== orderNumb))
  }
  updateAmount(orderNumb: string, value: number) {
    this.selectOrder.update(prev => prev.map(p => p.orderNumb === orderNumb ? ({ ...p, actualAmount: value }) : p))
  }

  onSubmit() {
    const periodId = this.periodId()
    const poList = this.selectOrder().map(({ actualAmount, orderNumb }) => ({ actualAmount, orderNumb }))
    this.periodService.insertPo(periodId, poList).subscribe({
      next: (res) => {
        console.log(res);
        this.success.emit('เพิ่ม po สำเร็จ');
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}
