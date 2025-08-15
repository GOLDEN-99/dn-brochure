import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TAppOIOrder } from '../../../../service/other-income/order.service';
import { PeriodService } from '../../../../service/other-income/period.service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-other-income-order-modal',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './other-income-order-modal.component.html',
  styleUrl: './other-income-order-modal.component.scss'
})
export class OtherIncomeOrderModalComponent {
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  periodId = input.required<number>()

  success = output<string>()
  fail = output<string>()
  close = output<void>()

  private periodService = inject(PeriodService)
  selectOrder = signal<TAppOIOrder[]>([])
  invalidOrder = computed(() => this.selectOrder().some(({ orderNumb }) => orderNumb === ''))
  sum = computed(() => this.selectOrder().reduce((acc, { actualAmount }) => acc + actualAmount, 0))
  periodAmount = input.required<number>()
  addOrder = () => {
    this.selectOrder.update(prev => [...prev, { orderNumb: '', actualAmount: 0 }])
  }
  deleteOrder(idx: number) {
    this.selectOrder.update(prev => prev.filter((_, i) => i !== idx))
  }
  updateAmount(idx: number, value: number) {
    this.selectOrder.update(prev => prev.map((p, i) => i === idx ? ({ ...p, actualAmount: value }) : p))
  }

  updateOrder(idx: number, order: string) {
    this.selectOrder.update(prev => prev.map((p, i) => i === idx ? ({ ...p, orderNumb: order }) : p))
  }

  onSubmit() {
    const periodId = this.periodId()
    const poList = this.selectOrder().map(({ actualAmount, orderNumb }) => ({ actualAmount, orderNumb }))
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
