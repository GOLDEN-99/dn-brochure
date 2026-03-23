import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OiNotLightPairService, TPairItem } from '../../../../service/other-income/oi-not-light-pair.service';
import { ToastService } from '../../../../service/toast/toast.service';

@Component({
  selector: 'app-not-light-single-dual',
  imports: [FormsModule, RouterLink],
  templateUrl: './not-light-single-dual.component.html',
  styleUrl: './not-light-single-dual.component.scss'
})
export class NotLightSingleDualComponent {
  private readonly pairServ = inject(OiNotLightPairService)
  private readonly toastService = inject(ToastService)

  term = signal('')

  pairList = computed(() => {
    const t = this.term().trim().toLowerCase()
    const list = this.pairServ.pairList()
    if (!t) return list
    return list.filter(p => p.displayName.toLowerCase().includes(t))
  })

  canAdd = computed(() => this.term().trim().length > 0)
  resultNotEmpty = computed(() => this.pairList().length !== 0)
  saving = signal(false)

  isCompletePair = (pair: TPairItem) => pair.dnCompCode && pair.huCompCode

  deleting = signal(false)

  onDelete(pairId: number) {
    if (this.deleting()) return
    this.deleting.set(true)
    this.pairServ.delete(pairId).subscribe({
      next: () => {
        this.toastService.success('ลบ pair สำเร็จ')
        this.deleting.set(false)
        this.pairServ.refetch()
      },
      error: (err) => {
        this.toastService.danger(err?.message ?? 'เกิดข้อผิดพลาด')
        this.deleting.set(false)
      }
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
        this.pairServ.refetch()
      },
      error: (err) => {
        this.toastService.danger(err?.message ?? 'เกิดข้อผิดพลาด')
        this.saving.set(false)
      }
    })
  }
}
