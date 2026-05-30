import { Component, computed, inject } from '@angular/core';
import { ImageUploaderComponent } from "../../shared/components/image-uploader/image-uploader.component";
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';

import { CnStateService } from '../../shared/services/cn-state.service';
import { FormField } from "@angular/forms/signals";
import { GoodItemComponent } from '../../shared/components/good-item/good-item.component';
import { DecimalPipe } from '@angular/common';
import { LoadingService } from '../../../service/loading/loading.service';
import { mapFormToApiRequest } from '../../shared/libs/format-request';
import { mapCheckedReturnListToGoodReq } from '../../shared/libs/good-item.lib';
import { CnApiService } from '../../shared/services/cn-api.service';

@Component({
  selector: 'cn-partial-cancel-order',
  imports: [ImageUploaderComponent, GoodItemComponent, FormField, DecimalPipe, RouterLink],
  templateUrl: './partial-cancel-order.component.html',
  styles: '',
})
export class PartialCancelOrderComponent {
  private readonly router = inject(Router)
  protected toast = inject(ToastService)
  private readonly cnState = inject(CnStateService)
  private readonly cnClient = inject(CnApiService)
  private readonly loading = inject(LoadingService)
  requestForm = this.cnState.requestCNForm
  checkCount = this.cnState.checkCount
  totalPrice = this.cnState.totalPrice
  cannotUpload = computed(() =>
    this.requestForm.stepOne().invalid()
    || this.requestForm.returnList().invalid()
    || this.requestForm.returnList().value().some(({ check, amount }) => check && amount === 0)
  )
  cannotSubmit = computed(() => this.requestForm().invalid())

  onSuccess(msg: string) {
    this.toast.success(msg)
  }
  onFail(msg: string) {
    this.toast.danger(msg)
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
    const goodList = mapCheckedReturnListToGoodReq(returnList)
    this.loading.startLoad()
    this.cnClient.submit({
      bankcode: bankCode, ...meta,
      ...temp,
      totalprice,
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
