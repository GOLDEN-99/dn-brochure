import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OiNotLightPairService, TPairItem } from '../../../../service/other-income/oi-not-light-pair.service';
import { ToastService } from '../../../../service/toast/toast.service';

@Component({
  selector: 'app-not-light-single-dual',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './not-light-single-dual.component.html',
  styleUrl: './not-light-single-dual.component.scss'
})
export class NotLightSingleDualComponent implements OnInit {
  private readonly pairServ = inject(OiNotLightPairService)
  private readonly toastService = inject(ToastService)

  private readonly _pairs = signal<TPairItem[]>([])
  term = signal('')

  pairList = computed(() => {
    const t = this.term().trim().toLowerCase()
    const list = this._pairs()
    if (!t) return list
    return list.filter(p => p.displayName.toLowerCase().includes(t))
  })

  canAdd = computed(() => this.term().trim().length > 0)
  resultNotEmpty = computed(() => this.pairList().length !== 0)
  saving = signal(false)

  isCompletePair = (pair: TPairItem) => pair.dnCompCode && pair.huCompCode

  ngOnInit() {
    this.load()
  }

  private load() {
    this.pairServ.getAll().subscribe({
      next: (list) => this._pairs.set(list),
      error: () => { }
    })
  }

  onAdd() {
    const name = this.term().trim()
    if (!name || this.saving()) return
    this.saving.set(true)
    this.pairServ.create(name).subscribe({
      next: () => {
        this.toastService.success('เพิ่ม pair สำเร็จ')
        this.term.set('')
        this.saving.set(false)
        this.load()
      },
      error: (err) => {
        this.toastService.danger(err?.message ?? 'เกิดข้อผิดพลาด')
        this.saving.set(false)
      }
    })
  }
}
