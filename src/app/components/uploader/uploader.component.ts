import { Component, computed, inject, input, signal } from '@angular/core';
import { ToastService } from '../../service/toast/toast.service';
import { LoadingService } from '../../service/loading/loading.service';
import { CnApiService } from '../../service/cn/cn-api/cn-api.service';
import { UploadImageService } from '../../service/cn/cn-upload-image/upload-image.service';

@Component({
  selector: 'app-uploader',
  imports: [],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss'
})
export class UploaderComponent {
  private readonly cnApi = inject(CnApiService)
  private readonly toast = inject(ToastService)
  private readonly loadingServ = inject(LoadingService)
  wholeNumb = computed(() => this.cnApi.paramsSignal()?.wholeNumb)
  private readonly uploadServ = inject(UploadImageService)
  fileList = this.uploadServ.image
  disabled = input(false)

  uploadSingle(img: string) { // accept blob here
    const wholeNumb = this.wholeNumb()
    if (!wholeNumb) {
      this.toast.danger("เกิดข้อผิดพลาด ลองเข้าใหม่อีกครั้ง")
      return
    }
    this.loadingServ.startLoad()
    this.uploadServ.uploadFileV2({ wholeNumb, img }).subscribe({
      next: () => { this.toast.success('อัพโหลดสำเร็จ') },
      error: () => { this.toast.danger('มีปัญหาอัพโหลด') },
      complete: () => this.loadingServ.endLoad()
    })
  }


  clearSelection() {
    this.uploadServ.clear()
  }

  onSelectFile(e: Event) {
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
      this.uploadSingle(file)
    };
    reader.readAsDataURL(file);
  }

  removeImage(link: string) {
    this.uploadServ.remove(link)
  }
}
