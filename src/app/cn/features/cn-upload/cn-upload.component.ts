import { Component, computed, inject, signal } from '@angular/core';
import { ImageUploaderComponent } from "../../shared/components/image-uploader/image-uploader.component";
import { FormField } from "@angular/forms/signals";
import { CnStateService } from '../../shared/services/cn-state.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/toast/toast.service';
import { mapStepOneFormToRequest } from '../../shared/libs/formatRequest';
import { CnApiService } from '../../shared/services/cn-api.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cn-upload',
  imports: [ImageUploaderComponent, FormField, FormsModule],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss',
})
export class CnUploadComponent {
  private readonly stateService = inject(CnStateService)
  private readonly cnClient = inject(CnApiService)
  private readonly toast = inject(ToastService)
  private readonly loading = inject(LoadingService)
  private readonly router = inject(Router)

  totalPrice = signal(0)

  invalidPrice = computed(() => {
    return this.totalPrice() <= 0
  })

  requestForm = this.stateService.requestCNForm
  disabled = computed(() =>
    this.requestForm.stepOne().invalid()
    || this.requestForm.image().invalid()
  )

  onError(msg: string) {
    this.toast.danger(msg)
  }

  onSuccess(msg: string) {
    this.toast.success(msg)
  }

  handleSubmit() {
    const form = this.requestForm();
    if (form.invalid()) {
      this.toast.danger('ข้อมูลไม่ครบ')
      return
    }
    const { metadata: { bankCode, ...meta },
      stepOne, image } = form.value()
    const temp = mapStepOneFormToRequest(stepOne);
    if (temp === null) {
      this.toast.danger('ข้อมูลหน้าแรกไม่ครบ')
      return
    }
    const totalprice = this.totalPrice()

    this.loading.startLoad()
    this.cnClient.submit({
      bankcode: bankCode, ...meta,
      ...temp,
      totalprice: totalprice,
      goodList: [],
      image
    }).subscribe({
      next: (res) => {
        this.toast.success('สำเร็จ')
        this.router.navigate(['cn', 'complete'])
      },
      error: (err) => {
        this.toast.danger('เกิดข้อผิดพลาด')
      },
      complete: () => {
        this.loading.endLoad()
      }
    })
  }
}
