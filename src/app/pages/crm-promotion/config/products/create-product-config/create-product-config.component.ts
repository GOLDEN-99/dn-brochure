import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../../../../service/toast/toast.service';
import { ProductConfigService } from '../../../../../service/crm-promotion/product-config.service';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../../../../../components/crm-promotion/form-alert-text.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product-config',
  imports: [FormField, FormAlertTextComponent],
  templateUrl: './create-product-config.component.html',
  styles: ''
})
export class CreateProductConfigComponent {
  private readonly toastService = inject(ToastService)
  private readonly productConfig = inject(ProductConfigService)
  private readonly router = inject(Router)


  disabled = signal(false)

  formState = signal({ name: '' })
  form = form<{ name: string }>(
    this.formState,
    (path) => {
      validate(path.name, ({ value }) => {
        const cleanValue = value().trim().toLocaleLowerCase();
        if (!cleanValue) return {
          kind: 'required',
          message: 'กรุณากรอกชื่อกลุ่มสินค้า'
        }
        if (this.productConfig.hasPromotionGroup(value())) {
          return { message: 'ชื่อกลุ่มสินค้าซ้ำ', kind: 'duplicate key' }
        }
        return null
      })
    }
  )
  onCreate() {
    this.disabled.set(true)
    const current = this.form();
    if (current.invalid()) {
      return
    }
    this.productConfig.createPromotionProductGroup({ name: current.value().name.trim() }).subscribe({
      next: res => {
        this.toastService.success('เพิ่มกลุ่มสำเร็จ')
        this.productConfig.refetchPromotionProductGroup()
        this.router.navigate(['/crm-promotion/config-product', res.id])
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
