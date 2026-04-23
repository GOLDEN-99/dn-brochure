import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionPriorityPipe } from '../../../lib/crm-promotion/promotion-priority.pipe';
import { PromotionOrderPipe } from '../../../lib/crm-promotion/promotion-order.pipe';

@Component({
  selector: 'app-promotions',
  imports: [DatePipe, RouterLink, FormsModule, PromotionPriorityPipe, PromotionOrderPipe],
  templateUrl: './promotions.component.html',
})
export class PromotionsComponent {
  private readonly service = inject(CrmPromotionService)

  statusFilter = signal('')
  togglingId = signal<number | null>(null)

  filteredPromotions = computed(() => {
    const list = this.service.allPromotions()
    const s = this.statusFilter()
    return s ? list.filter(p => p.promotionStatus === s) : list
  })

  toggleStatus(id: number, currentStatus: string) {
    const next = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    this.togglingId.set(id)
    this.service.togglePromotionStatus(id, next).subscribe({
      next: () => {
        this.service.refetchPromotions()
        this.togglingId.set(null)
      },
      error: () => this.togglingId.set(null),
    })
  }
}
