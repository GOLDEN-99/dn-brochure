import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { FormsModule } from '@angular/forms';
import { CnApiService } from '../../service/cn/cn-api/cn-api.service';
import { UploadImageService } from '../../service/cn/cn-upload-image/upload-image.service';
import { CnOrderService } from '../../service/cn/cn-order/cn-order.service';
import { CnRemarkService } from '../../service/cn/cn-remark/cn-remark.service';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-cn-upload',
  imports: [FormsModule, RouterLink, UploaderComponent],
  templateUrl: './cn-upload.component.html',
  styleUrl: './cn-upload.component.scss'
})
export class CnUploadComponent {

  totalprice = signal(0)
  cannotSubmit = computed(() => this.totalprice() === 0 || this.img.length === 0 && false)
  private cnApi = inject(CnApiService)
  private imgServ = inject(UploadImageService)
  img = this.imgServ.image
  private cnOrder = inject(CnOrderService)
  private cnRemark = inject(CnRemarkService)
  private toast = inject(ToastService)


  submit() {
    const head = this.cnApi.prependReq()
    const totalprice = this.totalprice()
    const image = this.img()
    const motive = this.cnRemark.prependReq()
    console.log({ ...head, image, ...motive, totalprice, goodList: [] })
    this.cnApi.submit({ ...head, image, ...motive, totalprice, goodList: [] }).subscribe({
      next: () => {
        this.toast.success('สำเร็จ')
      },
      error: () => {
        this.toast.danger('เกิดข้อผิดพลาด')
      }
    })
  }
}
