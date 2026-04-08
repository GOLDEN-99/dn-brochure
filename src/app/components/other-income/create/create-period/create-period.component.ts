import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { TIncomeItem } from '../../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PeriodService } from '../../../../service/other-income/period.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-create-period',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './create-period.component.html',
  styleUrl: './create-period.component.scss'
})
export class CreatePeriodComponent {
  private readonly cal = inject(NgbCalendar)
  private readonly today = this.cal.getToday();
  date = signal({ day: 1, month: this.today.month, year: this.today.year })
  eventType = input.required<number>()
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  headId = input.required<number>();
  incomeList = input.required<TIncomeItem[]>()
  success = output<string>()
  fail = output<string>()

  incomeState = signal<Array<TIncomeItem & { check: boolean }>>([])
  checkItem(id: number) {
    this.incomeState.update(prev => prev.map(p => p.id === id ? ({ ...p, check: !p.check }) : p))
  }
  periodName = signal("")
  periodRemark = signal("")
  sum = computed(() => this.incomeState().reduce((acc, { check, incomeAmount, actualAmount }) => check
    ? {
      totalAmount: acc.totalAmount + actualAmount,
      totalIncome: acc.totalIncome + incomeAmount
    } : acc,
    { totalAmount: 0, totalIncome: 0 })
  )

  step = input<any>()
  canEdit = input(false)
  isProduct = input(true)

  private readonly modalServ = inject(NgbModal)
  private readonly periodModal = viewChild('periodModal')
  openPeriod() {
    const incomeList = this.incomeList()
    const modIncome = incomeList
      .flatMap((income) => income.checkDate === null
        ? [{ ...income, check: false }]
        : []
      )
    this.incomeState.update(() => modIncome)
    this.modalServ.open(this.periodModal())
  }

  formateDate(iso: string) {
    const [yy, mm, _] = iso.split('T')[0].split('-')
    return `${mm}/${yy}`
  }
  get period() {
    const periodName = this.periodName()
    const periodRemark = this.periodRemark()
    const incState = this.incomeState()
    const monthlyList = incState.flatMap(({ id, check, startDate, endDate }) => check ? [{ id, startDate, endDate }] : [])
    const summary = this.sum()
    return { periodName, periodRemark, ...summary, monthlyList }
  }
  private readonly periodservice = inject(PeriodService)
  onAddPeriod() {
    const req = this.period
    const headId = this.headId()
    this.periodservice.createPeriod(headId, req).subscribe({
      next: ({ periodId }) => {
        this.success.emit('สร้าง  period สำเร็จ');
        this.modalServ.dismissAll();
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}