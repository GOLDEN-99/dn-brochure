import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { ToastService } from '../../../../service/toast/toast.service';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { TIncomeItem } from '../../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PeriodService } from '../../../../service/other-income/period.service';

@Component({
  selector: 'app-create-period',
  imports: [FormsModule],
  templateUrl: './create-period.component.html',
  styleUrl: './create-period.component.scss'
})
export class CreatePeriodComponent {
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  headId = input.required<number>();

  private toastServ = inject(ToastService)
  private notLightServ = inject(OiNotLightService)

  incomeList = input.required<TIncomeItem[]>()

  incomeState = signal<Array<TIncomeItem & { check: boolean }>>([])
  checkItem(id: number) {
    this.incomeState.update(prev => prev.map(p => p.id === id ? ({ ...p, check: !p.check }) : p))
  }
  remark = signal("")
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
  onSubmit() { }


  private modalServ = inject(NgbModal)
  private periodModal = viewChild('periodModal')
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
    const [yy, mm, dd] = iso.split('T')[0].split('-')
    return `${mm}/${yy}`
  }
  get period() {
    const remark = this.remark()
    const incState = this.incomeState()
    const monthlyList = incState.flatMap(({ id, check }) => check ? [id] : [])
    const summary = this.sum()
    return { remark, ...summary, monthlyList }
  }
  private periodservice = inject(PeriodService)
  onAddPeriod() {
    const req = this.period
    const headId = this.headId()
    this.periodservice.createPeriod(headId, req).subscribe({
      next: ({ periodId }) => {
        console.log(periodId);
        this.toastServ.success('สร้าง  period สำเร็จ')
        this.modalServ.dismissAll();
        this.notLightServ.refetch();
      },
      error: (err) => {
        this.toastServ.danger(err.message)
      }
    })
  }
}