import { Component, computed, inject, input, output, signal } from '@angular/core';
import { OrderService, TOiBill, TOiOrder } from '../../../../service/other-income/order.service';
import { PeriodService } from '../../../../service/other-income/period.service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DiscountSelectComponent } from "../../form/discount-select/discount-select.component";

@Component({
  selector: 'app-other-income-order-modal',
  imports: [FormsModule, DecimalPipe, DiscountSelectComponent],
  templateUrl: './other-income-order-modal.component.html',
  styleUrl: './other-income-order-modal.component.scss'
})
export class OtherIncomeOrderModalComponent {
  //search po set up
  private orderServ = inject(OrderService)
  orderList = this.orderServ.billDiscount
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  term = signal("")
  discType = signal(0)
  touch = signal(false)
  disabled = computed(() => this.compCode() === undefined || this.compType() === undefined || this.discType() === 0)

  periodId = input.required<number>()

  onSearch() {
    const compCode = this.compCode()
    const compType = this.compType()
    const discType = this.discType()
    const order = this.term()
    if (compCode === undefined || compType === undefined) return
    this.touch.set(true)
    this.orderServ.onSerach({
      compCode, compType, discType, order
    })
  }

  success = output<string>()
  fail = output<string>()
  close = output<void>()

  private periodService = inject(PeriodService)
  selectOrder = signal<Array<TOiOrder & { receNumb: string, remark: string }>>([])
  invalidOrder = computed(() => this.selectOrder().some(({ orderNumb }) => orderNumb === ''))
  sum = computed(() => this.selectOrder().reduce((acc, { discount }) => acc + discount, 0))
  periodAmount = input.required<number>()
  addOrder = () => {
    const currentOrder = this.selectOrder().map(({ orderNumb }) => orderNumb)
    const polist = this.orderList()
    const modPoList = polist.flatMap(({ orderNumb, discount, receList, remark }) => currentOrder.includes(orderNumb)
      ? []
      : [{ orderNumb, discount, receNumb: receList[0].receNumb, remark }])
    this.selectOrder.update(prev => [...prev, ...modPoList])
  }
  addSingleOrder = ({ orderNumb, discount, receList, remark }: TOiBill) => {
    const current = this.selectOrder()
    const occuranceIndex = current.findIndex(c => c.orderNumb === orderNumb)
    if (occuranceIndex === -1) {
      this.selectOrder.update((prev) => [...prev, { orderNumb, discount, receNumb: receList[0].receNumb, remark }])
    }
  }
  deleteOrder(orderNumb: string) {
    this.selectOrder.update(prev => prev.filter((order) => order.orderNumb !== orderNumb))
  }
  updateAmount(idx: number, value: number) {
    this.selectOrder.update(prev => prev.map((p, i) => i === idx ? ({ ...p, actualAmount: value }) : p))
  }

  updateOrder(idx: number, order: string) {
    this.selectOrder.update(prev => prev.map((p, i) => i === idx ? ({ ...p, orderNumb: order }) : p))
  }

  onSubmit() {
    const periodId = this.periodId()
    const poList = this.selectOrder().map(({ discount, orderNumb, receNumb, remark }) => ({ actualAmount: discount, orderNumb, receNumb, remark }))
    this.periodService.insertPo(periodId, poList).subscribe({
      next: (res) => {
        this.success.emit('เพิ่ม po สำเร็จ');
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}
