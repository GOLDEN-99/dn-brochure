import { Component, computed, inject, signal } from '@angular/core';
import { ImageUploaderComponent } from "../../shared/components/image-uploader/image-uploader.component";
import { FormField } from "@angular/forms/signals";
import { CnStateService } from '../../shared/services/cn-state.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/toast/toast.service';
import { mapFormToApiRequest } from '../../shared/libs/format-request';
import { CnApiService } from '../../shared/services/cn-api.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  private readonly route = inject(ActivatedRoute)

  totalPrice = signal(0)

  invalidPrice = computed(() => {
    return this.totalPrice() <= 0
  })

  requestForm = this.stateService.requestCNForm
  disabled = computed(() =>
    this.requestForm.stepOne().invalid()
    || this.requestForm.image().invalid()
    || this.invalidPrice()
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
      form.errorSummary().forEach(({ message, kind }) => this.toast.danger(`[${kind}] : ${message}`))
      return
    }
    const { metadata: { bankCode, ...meta },
      stepOne, image } = form.value()
    const temp = mapFormToApiRequest(stepOne);
    if (temp === null) {
      this.toast.danger('ข้อมูลหน้าแรกไม่ครบ')
      return
    }
    const totalprice = this.totalPrice()

    this.loading.startLoad()
    this.cnClient.submit({
      bankcode: bankCode || '0', ...meta,
      ...temp,
      totalprice: totalprice,
      goodList: [],
      image
    }).subscribe({
      next: (res) => {
        this.toast.success('สำเร็จ')
        this.loading.endLoad()
        this.router.navigate(['..', 'complete'], { relativeTo: this.route })
      },
      error: (err) => {
        this.toast.danger('เกิดข้อผิดพลาด')
        this.toast.danger(err.message)
        this.loading.endLoad()
      },
    })
  }
}
