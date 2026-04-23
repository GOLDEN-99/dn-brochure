import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../service/toast/toast.service';
import { ProductConfigService } from '../../../../service/crm-promotion/product-config.service';

@Component({
  selector: 'app-create-product-config',
  imports: [FormsModule, RouterLink],
  templateUrl: './create-product-config.component.html',
  styleUrl: './create-product-config.component.scss'
})
export class CreateProductConfigComponent {
  private readonly toastService = inject(ToastService)
  private readonly productConfig = inject(ProductConfigService)
  private readonly promotionProductGroup = this.productConfig.allPromotionProductGroup
  disabled = signal(false)
  canNotAdd = computed(() => this.searchTerm() === "" || this.renderGroup().length !== 0 || this.disabled())
  searchTerm = signal('')
  renderGroup = computed(() => {
    const term = this.searchTerm().toLocaleLowerCase()
    return this.promotionProductGroup().filter(group =>
      group.name.toLocaleLowerCase().includes(term)
    )
  })
  onCreate() {
    this.disabled.set(true)
    const name = this.searchTerm()
    this.productConfig.createPromotionProductGroup({ name }).subscribe({
      next: res => {
        this.toastService.success('เพิ่มกลุ่มสำเร็จ')
        this.productConfig.refetchPromotionProductGroup()
      },
      error: err => {
        this.toastService.danger('เกิดข้อผิดพลาดในการเพิ่มกลุ่ม')
        this.productConfig.refetchPromotionProductGroup()
      },
      complete: () => {
        this.disabled.set(false)
      }
    })
  }

  onEdit(id: number) {

  }

  onDelete(id: number) {

  }
}
