import { Component, inject, signal } from '@angular/core';
import { UploadImageService } from '../../service/cn-upload-image/upload-image.service';
import { CnApiService } from '../../service/cn-api/cn-api.service';
import { ToastService } from '../../service/toast/toast.service';
import { LoadingService } from '../../service/loading/loading.service';

@Component({
  selector: 'app-uploader',
  imports: [],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss'
})
export class UploaderComponent {
  private cnApi = inject(CnApiService)
  private toast = inject(ToastService)
  private loadingServ = inject(LoadingService)
  wholeNumb = this.cnApi.paramsSignal()?.wholeNumb
  private uploadServ = inject(UploadImageService)
  fileList = this.uploadServ.body
  uploadSingle(img: string | string, index: number) {
    if (!this.wholeNumb) {
      this.toast.danger("เกิดข้อผิดพลาด ลองเข้าใหม่อีกครั้ง")
      return
    }
    this.disableRemove.update(() => true)
    this.loadingServ.startLoad()
    this.uploadServ.uploadSingle({ wholeNumb: this.wholeNumb, passWord: "", img }, index).subscribe({
      next: () => {
        this.toast.success("อัพโหลดสำเร็จ")
        this.hasUpload.update(() => true)
      },
      error: (err) => {
        console.log(err)
        this.toast.danger("มีข้อผิดพลาด")
      },
      complete: () => {
        this.disableRemove.update(() => false)
        this.loadingServ.endLoad()
      }
    })
  }

  uploadAll() {
    console.log('click')
    if (!this.wholeNumb) {
      this.toast.danger("เกิดข้อผิดพลาด ลองเข้าใหม่อีกครั้ง")
      return
    }
    console.log("upload")
    this.disableRemove.update(() => true)
    this.loadingServ.startLoad()
    this.uploadServ.upload({ wholeNumb: this.wholeNumb, passWord: "" }).subscribe({
      next: () => {
        this.toast.success("อัพโหลดสำเร็จ")
        this.hasUpload.update(() => true)
      },
      error: (err) => {
        console.log(err)
        this.toast.danger("มีข้อผิดพลาด")
      },
      complete: () => {
        this.disableRemove.update(() => false)
        this.loadingServ.endLoad()
      }
    })
  }

  clearSelection() {
    this.uploadServ.clear()
  }

  onSelectFile(e: Event) {
    console.log(e)
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const file = e.target?.result as string
      this.uploadServ.appendFile(file)
    };
    reader.readAsDataURL(file);
  }

  disableRemove = signal(false)
  hasUpload = signal(false)

  removeImage(idx: number) {
    this.disableRemove.update(() => true)
    this.uploadServ.remove(idx)
    this.disableRemove.update(() => false)
  }
}
