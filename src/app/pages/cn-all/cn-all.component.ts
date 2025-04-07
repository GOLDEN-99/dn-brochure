import { Component, computed, inject } from '@angular/core';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { RouterLink } from '@angular/router';
import { UploadImageService } from '../../service/cn/cn-upload-image/upload-image.service';
import { CnOrderService } from '../../service/cn/cn-order/cn-order.service';
import { CnApiService } from '../../service/cn/cn-api/cn-api.service';
import { DecimalPipe } from '@angular/common';
import { CnRemarkService } from '../../service/cn/cn-remark/cn-remark.service';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-cn-all',
  imports: [UploaderComponent, RouterLink, DecimalPipe],
  templateUrl: './cn-all.component.html',
  styleUrl: './cn-all.component.scss'
})
export class CnAllComponent {
  private uploadServ = inject(UploadImageService)
  private orderServ = inject(CnOrderService)
  private cnServ = inject(CnApiService)
  private remarkServ = inject(CnRemarkService)
  private toast = inject(ToastService)
  head = this.cnServ.prependReq
  itemList = this.orderServ.wholeBillItem
  totalprice = this.orderServ.wholeBillSubtotal
  disable = computed(() =>
    this.uploadServ.noFile() || this.totalprice() === 0
  )
  submit() {
    const head = this.head()
    const goodList = this.itemList()
    const totalprice = this.totalprice()
    const motive = this.remarkServ.prependReq()
    const image = this.uploadServ.image()
    this.cnServ.submit({ ...head, goodList, image, totalprice, ...motive }).subscribe({
      next: () => {
        this.toast.success('สำเร็จ')
      },
      error: () => {
        this.toast.danger('เกิดข้อผิดพลาด')
      }
    }

    )
  }
}
