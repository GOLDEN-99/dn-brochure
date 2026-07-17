import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../../../../service/toast/toast.service';
import { BranchConfigService } from '../../../../../service/crm-promotion/branch-config.service';
import { Router } from '@angular/router';
import { form, FormField, validate } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../../../../../components/crm-promotion/form-alert-text.component";


@Component({
  selector: 'app-create-branch-config',
  imports: [FormField, FormAlertTextComponent],
  templateUrl: './create-branch-config.component.html',
  styles: ''
})
export class CreateBranchConfigComponent {
  private readonly router = inject(Router)
  private readonly toastService = inject(ToastService)
  private readonly crmGroupService = inject(BranchConfigService)

  disabled = signal(false)

  formState = signal({ name: '' })
  form = form<{ name: string }>(
    this.formState,
    (path) => {
      validate(path.name, ({ value }) => {
        const cleanValue = value().trim().toLocaleLowerCase();
        if (!cleanValue) return {
          kind: 'required',
          message: 'กรุณากรอกชื่อกลุ่มสาขา'
        }
        if (this.crmGroupService.hasBranchGroup(value())) {
          return { message: 'ชื่อกลุ่มสาขาซ้ำ', kind: 'duplicate key' }
        }
        return null
      })
    }
  )
  onCreate() {
    const currentValue = this.form();
    if (currentValue.invalid()) {
      return
    }
    this.crmGroupService.createBranchGroup({ name: currentValue.value().name.trim() }).subscribe({
      next: res => {
        this.toastService.success('เพิ่มกลุ่มสำเร็จ')
        this.crmGroupService.refetchBranchGroup()
        this.router.navigate(['/crm-promotion/config-branch', res.id])
      },
      error: err => {
        this.toastService.danger('เกิดข้อผิดพลาดในการเพิ่มกลุ่ม')
        this.crmGroupService.refetchBranchGroup()
      },
      complete: () => {
        this.disabled.set(false)
      }
    })
  }

}
