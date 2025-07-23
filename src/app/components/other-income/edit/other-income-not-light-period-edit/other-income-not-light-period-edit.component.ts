import { Component, computed, inject, input, OnInit, signal, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TIncomeItem, TPeriodResult } from '../../../../service/other-income/base-oi';
import { PeriodService } from '../../../../service/other-income/period.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { DecimalPipe } from '@angular/common';
import { OrderService, TAppOIOrder, TOiOrder } from '../../../../service/other-income/order.service';
import { TAppOrder } from '../../../../types/ibob-supplier.type';

@Component({
  selector: 'app-other-income-not-light-period-edit',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './other-income-not-light-period-edit.component.html',
  styleUrl: './other-income-not-light-period-edit.component.scss'
})
export class OtherIncomeNotLightPeriodEditComponent implements OnInit {
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  headId = input.required<number>();
  periodList = input<TPeriodResult[]>([])
  canEdit = input(false)

  private toastServ = inject(ToastService)
  private notLightServ = inject(OiNotLightService)
  private modalServ = inject(NgbModal)
  private poService = inject(OrderService)
  private periodService = inject(PeriodService)
  term = this.poService.term
  orderList = this.poService.queryOrder
  selectOrder = signal<TAppOIOrder[]>([])
  sum = computed(() => this.selectOrder().reduce((acc, { actualAmount }) => acc + actualAmount, 0))
  periodId = signal(0)
  periodAmount = signal(0)
  private orderSet = new Set()
  addOrder = (order: TOiOrder) => {
    const hasValue = this.orderSet.has(order.orderNumb)
    if (hasValue) {
      this.toastServ.danger("po ซ้ำ")
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
  private poModal = viewChild('poModal')
  ngOnInit(): void {

  }

  openModal(periodId: number, periodAmou: number) {
    const compCode = this.compCode()
    const compType = this.compType()
    if (!compType || !compCode) return
    this.selectOrder.set([])
    this.orderSet.clear()
    this.periodId.set(periodId)
    this.periodAmount.set(periodAmou)
    this.poService.setComp(compCode, compType)
    this.modalServ.open(this.poModal())
  }


  onSubmit() {
    const periodId = this.periodId()
    const poList = this.selectOrder().map(({ actualAmount, orderNumb }) => ({ actualAmount, orderNumb }))
    this.periodService.insertPo(periodId, poList).subscribe({
      next: (res) => {
        console.log(res);
        this.toastServ.success('เพิ่ม po สำเร็จ');
        this.notLightServ.refetch();
        this.modalServ.dismissAll();
      },
      error: (err) => {
        this.toastServ.danger(err.message);
      }
    })
  }

}
