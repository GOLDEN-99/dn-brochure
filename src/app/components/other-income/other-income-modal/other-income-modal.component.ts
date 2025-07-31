import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-modal',
  imports: [FormsModule],
  templateUrl: './other-income-modal.component.html',
  styleUrl: './other-income-modal.component.scss'
})
export class OtherIncomeModalComponent {

  activeModal = inject(NgbActiveModal);

  modalLabel = signal('')

  amount = signal(100_000)
  actual = signal(95_000)
  diff = computed(() => this.amount() - this.actual())
  remark = signal('')

  isComplete = signal(false)

  category = signal(0)

  poList = signal<TPoItem[]>([{ opNumb: '', total: 0 }])

  addPoList = () => this.poList.update((p) => [...p, { opNumb: '', total: 0 }])

  poLength = computed(() => this.poList().length)

  deleteItem = (idx: number) => this.poList.update(p => p.filter((_, i) => i !== idx))

  updateList = <K extends keyof TPoItem>(key: K) => (idx: number) => (value: TPoItem[K]) =>
    this.poList.update(prev => prev.map((p, i) => i === idx ? ({ ...p, [key]: value }) : p))

  updateNumb = this.updateList('opNumb')

  updateTotal = this.updateList('total')

  debtName = signal('')
}
export type TPoItem = {
  opNumb: string
  total: number
}