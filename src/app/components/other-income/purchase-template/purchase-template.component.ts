import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { OtherIncomeModalComponent } from '../other-income-modal/other-income-modal.component';

@Component({
  selector: 'app-purchase-template',
  imports: [FormsModule, NgbDatepickerModule, RouterLink],
  templateUrl: './purchase-template.component.html',
  styleUrl: './purchase-template.component.scss'
})
export class PurchaseTemplateComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private query$ = this.route.queryParamMap.pipe(map(p => {
    const status = p.get('status')
    const mode = p.get('mode')
    return { status, mode }
  }))
  private query = toSignal(this.query$, { initialValue: { status: null, mode: null } })
  isComplete = computed(() => this.query().status === 'complete')
  isView = computed(() => this.query().mode !== 'edit')
  incVat = signal<boolean>(false)
  discount = signal(false)
  target = signal(0)
  percent = signal(0)
  invalidPercentTarget = computed(() => this.target() === 1 && this.percent() === 0)
  period = signal(0)
  limit = signal(false)
  limitAmount = signal(0)
  toggleLimit = (value: boolean) => {
    if (!value) {
      this.limitAmount.update(() => 0)
    }
    this.limit.update(prev => !prev)
  }
  calendar = inject(NgbCalendar);
  fromDate = signal(this.calendar.getToday())
  toDate = signal(this.calendar.getToday())

  step = signal<TStepItem[]>([])

  private changeStepItem = <K extends keyof TStepItem>(k: K) => (idx: number) => (value: TStepItem[K]) => {
    this.step.update((prev) => prev.map((p, i) => i === idx ? ({ ...p, [k]: Number(value) }) : p))
  }

  changeStart = this.changeStepItem('start')

  changePercent = this.changeStepItem('percent')

  private modalService = inject(NgbModal)

  btnLabel = computed(() => this.isComplete() ? 'เพิ่มข้อมูลรับรู้รายได้' : 'เพิ่มข้อมูล confirm รายเดือน')

  openModal() {
    const ref = this.modalService.open(OtherIncomeModalComponent)
    ref.componentInstance.modalLabel.update(() => this.btnLabel())
    ref.componentInstance.isComplete.update(() => this.isComplete())
  }

  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }

  setFromDate(date: NgbDate | null) {
    console.log(date)
    if (!date) return
    this.fromDate.update(() => date)
  }

}

type TStepItem = {
  start: number
  percent: number
}