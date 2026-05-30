import { Component, computed, inject } from '@angular/core';
import { CnApiService } from '../../shared/services/cn-api.service';
import { CnStateService } from '../../shared/services/cn-state.service';
import { ImageUploaderComponent } from "../../shared/components/image-uploader/image-uploader.component";
import { ToastService } from '../../../service/toast/toast.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { FormField } from "@angular/forms/signals";
import { mapFormToApiRequest } from '../../shared/libs/format-request';
import { mapReturnListToGoodReq } from '../../shared/libs/good-item.lib';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-whole-cancel-order',
  imports: [ImageUploaderComponent, FormField, DecimalPipe, RouterLink],
  templateUrl: './whole-cancel-order.component.html',
  styleUrl: './whole-cancel-order.component.scss',
})
export class WholeCancelOrderComponent {
  private readonly toast = inject(ToastService)
  private readonly loading = inject(LoadingService)
  private readonly router = inject(Router)
  private readonly cnClient = inject(CnApiService)
  private readonly cnState = inject(CnStateService)

  requestForm = this.cnState.requestCNForm
  totalPrice = computed(() => this.requestForm.returnList().value().reduce((acc, { good: { subTotal } }) => acc + subTotal, 0))
  alterText = computed(() => {
    const prev = this.cnState.requestCNForm.stepOne.cnCount().value();
    if (prev > 0) return `เคย cn ไปแล้ว ${prev} ชิ้น ไม่สามารถ cn ทั้งรายการได้`
    return ""
  })

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
      stepOne, returnList, image } = form.value()
    const temp = mapFormToApiRequest(stepOne);
    if (temp === null) {
      this.toast.danger('ข้อมูลหน้าแรกไม่ครบ')
      return
    }
    const totalprice = this.totalPrice()
    const goodList = mapReturnListToGoodReq(returnList)

    this.loading.startLoad()
    this.cnClient.submit({
      bankcode: bankCode, ...meta,
      ...temp,
      totalprice: totalprice,
      goodList,
      image
    }).subscribe({
      next: (res) => {
        this.toast.success('สำเร็จ')
        this.router.navigate(['..', 'complete'])
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
